create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.has_any_role(required_roles text[])
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.users u
    where u.auth_user_id = auth.uid()
      and u.role = any(required_roles)
  );
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('Super Admin', 'Hostel Admin', 'Mess Manager', 'Staff', 'Student')),
  phone text,
  department text,
  year text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  floors int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete cascade,
  room_number text not null,
  block text not null,
  floor int not null default 1,
  beds int not null default 2,
  occupied_beds int not null default 0,
  status text not null check (status in ('available', 'occupied', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, room_number)
);

create table if not exists public.beds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  label text not null,
  status text not null default 'available' check (status in ('available', 'occupied', 'maintenance')),
  student_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, label)
);

create table if not exists public.students (
  id uuid primary key references public.users(id) on delete cascade,
  roll_number text not null unique,
  admission_status text not null default 'Active' check (admission_status in ('Active', 'Transferred', 'Checked Out')),
  room_id uuid references public.rooms(id) on delete set null,
  bed_id uuid references public.beds(id) on delete set null,
  emergency_contact text,
  guardian_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_allocations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  bed_id uuid references public.beds(id) on delete set null,
  allocated_by uuid references public.users(id) on delete set null,
  allocated_at timestamptz not null default now(),
  vacated_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mess_menu (
  id uuid primary key default gen_random_uuid(),
  serving_date date not null,
  weekday text not null,
  meal_type text not null check (meal_type in ('Breakfast', 'Lunch', 'Dinner')),
  title text not null,
  description text,
  allergens text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (serving_date, meal_type)
);

create table if not exists public.meal_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  meal_type text not null check (meal_type in ('Breakfast', 'Lunch', 'Dinner')),
  served_on date not null,
  present boolean not null default true,
  recorded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, meal_type, served_on)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  item_name text not null unique,
  unit text not null,
  current_stock numeric(12,2) not null default 0,
  threshold numeric(12,2) not null default 0,
  last_restocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  billing_month date not null,
  hostel_fee numeric(12,2) not null default 0,
  mess_fee numeric(12,2) not null default 0,
  fine_amount numeric(12,2) not null default 0,
  due_amount numeric(12,2) not null default 0,
  status text not null check (status in ('Paid', 'Due', 'Overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, billing_month)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  fee_id uuid not null references public.fees(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_method text not null,
  receipt_no text not null unique,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  category text not null check (category in ('Electricity', 'Water', 'Internet', 'Room', 'Food', 'Other')),
  title text not null,
  description text,
  status text not null check (status in ('Pending', 'In Progress', 'Resolved')),
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  assigned_to uuid references public.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_students_department on public.students using btree (roll_number);
create index if not exists idx_rooms_status on public.rooms using btree (status);
create index if not exists idx_complaints_status on public.complaints using btree (status);
create index if not exists idx_payments_paid_at on public.payments using btree (paid_at desc);

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger hostels_set_updated_at before update on public.hostels for each row execute function public.set_updated_at();
create trigger rooms_set_updated_at before update on public.rooms for each row execute function public.set_updated_at();
create trigger beds_set_updated_at before update on public.beds for each row execute function public.set_updated_at();
create trigger students_set_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger room_allocations_set_updated_at before update on public.room_allocations for each row execute function public.set_updated_at();
create trigger mess_menu_set_updated_at before update on public.mess_menu for each row execute function public.set_updated_at();
create trigger meal_attendance_set_updated_at before update on public.meal_attendance for each row execute function public.set_updated_at();
create trigger inventory_set_updated_at before update on public.inventory for each row execute function public.set_updated_at();
create trigger fees_set_updated_at before update on public.fees for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger complaints_set_updated_at before update on public.complaints for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.hostels enable row level security;
alter table public.rooms enable row level security;
alter table public.beds enable row level security;
alter table public.students enable row level security;
alter table public.room_allocations enable row level security;
alter table public.mess_menu enable row level security;
alter table public.meal_attendance enable row level security;
alter table public.inventory enable row level security;
alter table public.fees enable row level security;
alter table public.payments enable row level security;
alter table public.complaints enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their profile" on public.users for select using (auth.uid() = auth_user_id or public.has_any_role(array['Super Admin', 'Hostel Admin']));
create policy "Admins can manage profiles" on public.users for all using (public.has_any_role(array['Super Admin', 'Hostel Admin'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin']));

create policy "Authenticated users can read hostels" on public.hostels for select using (auth.role() = 'authenticated' or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));
create policy "Admins can manage hostels" on public.hostels for all using (public.has_any_role(array['Super Admin', 'Hostel Admin'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin']));

create policy "Authenticated users can read rooms" on public.rooms for select using (auth.role() = 'authenticated' or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff', 'Mess Manager']));
create policy "Admins can manage rooms" on public.rooms for all using (public.has_any_role(array['Super Admin', 'Hostel Admin'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin']));

create policy "Authenticated users can read beds" on public.beds for select using (auth.role() = 'authenticated');
create policy "Admins can manage beds" on public.beds for all using (public.has_any_role(array['Super Admin', 'Hostel Admin'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin']));

create policy "Students can read own profile" on public.students for select using (auth.uid() = id or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));
create policy "Admins can manage students" on public.students for all using (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));

create policy "Students can read own allocations" on public.room_allocations for select using (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']) or student_id = auth.uid());
create policy "Admins can manage allocations" on public.room_allocations for all using (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));

create policy "Authenticated users can read menu" on public.mess_menu for select using (auth.role() = 'authenticated');
create policy "Mess staff can manage menu" on public.mess_menu for all using (public.has_any_role(array['Super Admin', 'Mess Manager', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Mess Manager', 'Staff']));

create policy "Authenticated users can read meal attendance" on public.meal_attendance for select using (auth.role() = 'authenticated');
create policy "Mess staff can manage meal attendance" on public.meal_attendance for all using (public.has_any_role(array['Super Admin', 'Mess Manager', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Mess Manager', 'Staff']));

create policy "Authenticated users can read inventory" on public.inventory for select using (auth.role() = 'authenticated');
create policy "Mess staff can manage inventory" on public.inventory for all using (public.has_any_role(array['Super Admin', 'Mess Manager'])) with check (public.has_any_role(array['Super Admin', 'Mess Manager']));

create policy "Students can read own fees" on public.fees for select using (student_id = auth.uid() or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));
create policy "Admins can manage fees" on public.fees for all using (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));

create policy "Students can read own payments" on public.payments for select using (student_id = auth.uid() or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));
create policy "Admins can manage payments" on public.payments for all using (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));

create policy "Students can read own complaints" on public.complaints for select using (student_id = auth.uid() or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));
create policy "Students can create complaints" on public.complaints for insert with check (student_id = auth.uid() or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));
create policy "Staff can manage complaints" on public.complaints for update using (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));

create policy "Users can read own notifications" on public.notifications for select using (user_id = auth.uid() or public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));
create policy "Admins can manage notifications" on public.notifications for all using (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff'])) with check (public.has_any_role(array['Super Admin', 'Hostel Admin', 'Staff']));

create policy "Admins can read audit logs" on public.audit_logs for select using (public.has_any_role(array['Super Admin', 'Hostel Admin']));
create policy "Service roles can write audit logs" on public.audit_logs for insert with check (true);
