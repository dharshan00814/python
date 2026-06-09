# Hostel & Mess Management System

Premium full-stack Hostel & Mess Management System built with React, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, Node.js, Express.js, Supabase, React Router, React Hook Form, and Recharts.

## What is included

- Futuristic landing page with a 3D hostel scene, particle-style background, and CTA flow.
- Secure auth shell with login, register, and forgot-password flows.
- Role-aware dashboard with counters, charts, room visualization, and activity feed.
- Module views for students, hostel operations, mess planning, fees, complaints, reports, and settings.
- Express API with resource routes and a reusable in-memory store for local development.
- Supabase SQL schema with tables, indexes, triggers, and RLS policies.

## Project Structure

```text
client/   React frontend
server/   Express backend
supabase/ SQL schema and RLS
```

## Setup

1. Copy `client/.env.example` to `client/.env` and fill in your Supabase values.
2. Copy `server/.env.example` to `server/.env` and configure your backend secrets.
3. Apply `supabase/schema.sql` in the Supabase SQL editor.
4. Install dependencies in each workspace.

```bash
npm install
npm --prefix server run dev
npm --prefix client run dev
```

## Environment Variables

### Client

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

### Server

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

## API Overview

Base path: `/api/v1`

- `GET /dashboard/summary`
- `GET /dashboard/activity`
- `GET /students`
- `POST /students`
- `GET /students/:studentId`
- `PUT /students/:studentId`
- `GET /hostels`
- `GET /rooms`
- `POST /rooms`
- `PATCH /rooms/:roomId/status`
- `GET /mess/menu`
- `PUT /mess/menu/:menuId`
- `GET /mess/inventory`
- `PATCH /mess/inventory/:inventoryId`
- `GET /mess/attendance`
- `POST /mess/attendance`
- `GET /fees`
- `POST /fees`
- `GET /payments`
- `POST /payments`
- `GET /complaints`
- `POST /complaints`
- `PATCH /complaints/:complaintId`
- `GET /notifications`
- `PATCH /notifications/:notificationId/read`
- `GET /reports/:type`

## Supabase Notes

- The schema includes a `users` profile table linked to `auth.users`.
- Row Level Security is enabled on all core tables.
- Admin roles are modeled as `Super Admin`, `Hostel Admin`, `Mess Manager`, `Staff`, and `Student`.
- The server can use Supabase auth with a service role key when you wire it up for production.

## Production Checklist

- Configure real Supabase auth and storage buckets.
- Replace the in-memory backend store with Supabase queries for persistence.
- Add deployment env vars for the frontend and backend.
- Set up your hosting provider for both apps.
