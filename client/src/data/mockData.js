export const roleOptions = [
  "Super Admin",
  "Hostel Admin",
  "Mess Manager",
  "Staff",
  "Student",
];

export const navItems = [
  { label: "Dashboard", path: "/app/dashboard", icon: "sparkles" },
  { label: "Students", path: "/app/students", icon: "users" },
  { label: "Hostel", path: "/app/hostel", icon: "building" },
  { label: "Mess", path: "/app/mess", icon: "utensils" },
  { label: "Fees", path: "/app/fees", icon: "wallet" },
  { label: "Complaints", path: "/app/complaints", icon: "message-square" },
  { label: "Reports", path: "/app/reports", icon: "bar-chart-3" },
  { label: "Settings", path: "/app/settings", icon: "settings" },
];

export const landingFeatures = [
  {
    title: "Unified operations",
    description: "Manage rooms, students, mess, payments, and complaints from a single command center.",
  },
  {
    title: "Real-time awareness",
    description: "Supabase Realtime notifications keep admins and students synchronized.",
  },
  {
    title: "Enterprise controls",
    description: "Role-based access, validation, RLS policies, and audit logs protect the platform.",
  },
];

export const dashboardMetrics = [
  { label: "Total Students", value: 642, delta: "+12 this month", tone: "blue" },
  { label: "Occupied Rooms", value: 184, delta: "91% occupancy", tone: "purple" },
  { label: "Available Rooms", value: 16, delta: "2 blocks ready", tone: "aqua" },
  { label: "Monthly Revenue", value: "₹9.4L", delta: "+8.2% growth", tone: "blue" },
  { label: "Pending Fees", value: "₹1.8L", delta: "38 overdue ledgers", tone: "purple" },
  { label: "Today's Meals", value: "1,248", delta: "Breakfast + lunch served", tone: "aqua" },
  { label: "Active Complaints", value: 14, delta: "4 priority issues", tone: "blue" },
];

export const occupancySeries = [
  { name: "Mon", occupied: 165, maintenance: 11, available: 24 },
  { name: "Tue", occupied: 170, maintenance: 10, available: 20 },
  { name: "Wed", occupied: 176, maintenance: 12, available: 18 },
  { name: "Thu", occupied: 180, maintenance: 12, available: 14 },
  { name: "Fri", occupied: 184, maintenance: 10, available: 12 },
  { name: "Sat", occupied: 182, maintenance: 9, available: 15 },
  { name: "Sun", occupied: 184, maintenance: 8, available: 14 },
];

export const feeSeries = [
  { month: "Jan", collected: 6.8, pending: 2.2 },
  { month: "Feb", collected: 7.1, pending: 2.0 },
  { month: "Mar", collected: 7.9, pending: 1.7 },
  { month: "Apr", collected: 8.5, pending: 1.5 },
  { month: "May", collected: 9.1, pending: 1.3 },
  { month: "Jun", collected: 9.4, pending: 1.1 },
];

export const roomGrid = [
  ["available", "occupied", "occupied", "maintenance", "available"],
  ["occupied", "occupied", "available", "occupied", "available"],
  ["available", "maintenance", "occupied", "occupied", "occupied"],
  ["available", "available", "occupied", "occupied", "available"],
];

export const students = [
  {
    id: "ST-1042",
    name: "Ananya Rao",
    department: "CSE",
    year: "3rd Year",
    room: "B-204",
    attendance: 96,
    fees: "Paid",
    complaints: 1,
    contact: "+91 98765 43210",
  },
  {
    id: "ST-1058",
    name: "Rahul Menon",
    department: "ECE",
    year: "2nd Year",
    room: "A-112",
    attendance: 91,
    fees: "Due",
    complaints: 0,
    contact: "+91 99887 66554",
  },
  {
    id: "ST-1183",
    name: "Farah Khan",
    department: "MBA",
    year: "1st Year",
    room: "C-308",
    attendance: 98,
    fees: "Paid",
    complaints: 2,
    contact: "+91 91234 56780",
  },
];

export const complaintItems = [
  { title: "Water leakage in B block", status: "Pending", priority: "High" },
  { title: "Wi-Fi outage on 2nd floor", status: "In Progress", priority: "Medium" },
  { title: "Mess breakfast feedback", status: "Resolved", priority: "Low" },
];

export const moduleConfigs = {
  students: {
    title: "Student Management",
    subtitle: "Add, search, filter, and review student profiles with room, attendance, fees, and complaints.",
    accent: "blue",
    metrics: [
      { label: "Active Students", value: "642" },
      { label: "Placed in Rooms", value: "612" },
      { label: "Verified Profiles", value: "598" },
    ],
    filters: ["Department", "Year", "Fee Status", "Room Block"],
    table: {
      columns: ["Student", "Department", "Room", "Attendance", "Fees", "Complaints"],
      rows: students.map((student) => [
        student.name,
        student.department,
        student.room,
        `${student.attendance}%`,
        student.fees,
        `${student.complaints}`,
      ]),
    },
    cards: students,
  },
  hostel: {
    title: "Hostel Operations",
    subtitle: "Track blocks, rooms, beds, transfers, check-ins, and maintenance at a glance.",
    accent: "purple",
    metrics: [
      { label: "Blocks", value: "6" },
      { label: "Beds Filled", value: "624/680" },
      { label: "Maintenance", value: "10 rooms" },
    ],
    filters: ["Block", "Floor", "Room Type", "Status"],
    roomGrid,
    cards: [
      { label: "Available Rooms", value: 16, note: "Ready for allocation" },
      { label: "Maintenance Rooms", value: 10, note: "Awaiting clearance" },
      { label: "Transfers Today", value: 5, note: "Across 3 blocks" },
    ],
  },
  mess: {
    title: "Mess Management",
    subtitle: "Plan menus, control inventory, and capture meal attendance with consumption reports.",
    accent: "aqua",
    metrics: [
      { label: "Meal Attendance", value: "1,248" },
      { label: "Inventory SKUs", value: "28" },
      { label: "Weekly Menu Slots", value: "21" },
    ],
    menu: [
      { day: "Mon", breakfast: "Idli", lunch: "Rice + Sambar", dinner: "Chapati + Paneer" },
      { day: "Tue", breakfast: "Dosa", lunch: "Veg Meals", dinner: "Fried Rice" },
      { day: "Wed", breakfast: "Pongal", lunch: "Chicken Curry", dinner: "Noodles" },
    ],
    inventory: [
      { item: "Rice", stock: "240 kg", trend: "+24 kg" },
      { item: "Milk", stock: "180 L", trend: "Stable" },
      { item: "Vegetables", stock: "96 kg", trend: "Low" },
    ],
  },
  fees: {
    title: "Fee Management",
    subtitle: "Manage hostel fee, mess fee, fines, receipts, payment history, and due reminders.",
    accent: "blue",
    metrics: [
      { label: "Collected", value: "₹9.4L" },
      { label: "Pending", value: "₹1.1L" },
      { label: "Receipts", value: "368" },
    ],
    payments: [
      { student: "Ananya Rao", amount: "₹24,000", status: "Paid", method: "UPI" },
      { student: "Rahul Menon", amount: "₹18,500", status: "Due", method: "Pending" },
      { student: "Farah Khan", amount: "₹27,000", status: "Paid", method: "Card" },
    ],
  },
  complaints: {
    title: "Complaint Management",
    subtitle: "Route complaints, track statuses, and keep students informed in real time.",
    accent: "purple",
    metrics: [
      { label: "Open", value: "14" },
      { label: "In Progress", value: "6" },
      { label: "Resolved", value: "48" },
    ],
    complaints: complaintItems,
  },
  reports: {
    title: "Reports & Insights",
    subtitle: "Export attendance, fee, occupancy, mess, and complaint reports to PDF or Excel.",
    accent: "aqua",
    metrics: [
      { label: "Exports This Month", value: "86" },
      { label: "Scheduled Jobs", value: "12" },
      { label: "Last Generated", value: "2 min ago" },
    ],
    exports: ["Attendance Report", "Fee Collection Report", "Occupancy Report", "Mess Consumption Report", "Complaint Report"],
  },
  settings: {
    title: "Security & Preferences",
    subtitle: "Configure roles, notifications, storage, backups, and platform defaults.",
    accent: "blue",
    metrics: [
      { label: "Enabled Roles", value: "5" },
      { label: "Notification Channels", value: "3" },
      { label: "Backup Frequency", value: "Daily" },
    ],
    cards: [
      { label: "JWT Authentication", value: "Enabled", note: "Supabase auth + protected routes" },
      { label: "RLS Policies", value: "Active", note: "Database access is role-aware" },
      { label: "Storage Buckets", value: "Photos + Receipts", note: "Optimized for uploads" },
      { label: "Realtime Streams", value: "Connected", note: "Notifications and updates sync live" },
    ],
  },
};

export const dashboardFeed = [
  "Fee due reminders sent to 38 students",
  "Room transfer completed for B-204 to A-112",
  "Complaint escalated: water leakage in B block",
  "Menu update published for the weekly dinner cycle",
];
