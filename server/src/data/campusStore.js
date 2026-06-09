const clone = (value) => JSON.parse(JSON.stringify(value));

const baseStudents = [
  {
    id: "ST-1042",
    name: "Ananya Rao",
    email: "ananya.rao@campus.edu",
    department: "CSE",
    year: "3rd Year",
    room: "B-204",
    attendance: 96,
    feeStatus: "Paid",
    complaintCount: 1,
    emergencyContact: "+91 98765 43210",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ST-1058",
    name: "Rahul Menon",
    email: "rahul.menon@campus.edu",
    department: "ECE",
    year: "2nd Year",
    room: "A-112",
    attendance: 91,
    feeStatus: "Due",
    complaintCount: 0,
    emergencyContact: "+91 99887 66554",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ST-1183",
    name: "Farah Khan",
    email: "farah.khan@campus.edu",
    department: "MBA",
    year: "1st Year",
    room: "C-308",
    attendance: 98,
    feeStatus: "Paid",
    complaintCount: 2,
    emergencyContact: "+91 91234 56780",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  },
];

const baseRooms = [
  { id: "A-101", block: "A", floor: 1, beds: 2, occupiedBeds: 2, status: "occupied" },
  { id: "A-102", block: "A", floor: 1, beds: 2, occupiedBeds: 1, status: "available" },
  { id: "A-112", block: "A", floor: 1, beds: 3, occupiedBeds: 3, status: "occupied" },
  { id: "B-204", block: "B", floor: 2, beds: 2, occupiedBeds: 1, status: "available" },
  { id: "B-206", block: "B", floor: 2, beds: 2, occupiedBeds: 2, status: "occupied" },
  { id: "C-308", block: "C", floor: 3, beds: 2, occupiedBeds: 0, status: "maintenance" },
  { id: "C-310", block: "C", floor: 3, beds: 2, occupiedBeds: 1, status: "available" },
];

const state = {
  students: clone(baseStudents),
  rooms: clone(baseRooms),
  hostels: [
    { id: "H-1", name: "North Block", floors: 4, rooms: 48, occupied: 43 },
    { id: "H-2", name: "South Block", floors: 3, rooms: 36, occupied: 31 },
    { id: "H-3", name: "Lake View", floors: 5, rooms: 52, occupied: 50 },
  ],
  menu: [
    { id: "M-1", day: "Mon", breakfast: "Idli", lunch: "Rice + Sambar", dinner: "Chapati + Paneer" },
    { id: "M-2", day: "Tue", breakfast: "Dosa", lunch: "Veg Meals", dinner: "Fried Rice" },
    { id: "M-3", day: "Wed", breakfast: "Pongal", lunch: "Chicken Curry", dinner: "Noodles" },
    { id: "M-4", day: "Thu", breakfast: "Upma", lunch: "Rice + Dal", dinner: "Parotta" },
    { id: "M-5", day: "Fri", breakfast: "Vada", lunch: "Meals + Salad", dinner: "Pulav" },
  ],
  inventory: [
    { id: "I-1", item: "Rice", stock: 240, unit: "kg", threshold: 120 },
    { id: "I-2", item: "Milk", stock: 180, unit: "L", threshold: 90 },
    { id: "I-3", item: "Vegetables", stock: 96, unit: "kg", threshold: 60 },
    { id: "I-4", item: "Groceries", stock: 78, unit: "packs", threshold: 35 },
  ],
  meals: [
    { id: "MA-1", meal: "Breakfast", served: 598, total: 642, date: new Date().toISOString().slice(0, 10) },
    { id: "MA-2", meal: "Lunch", served: 612, total: 642, date: new Date().toISOString().slice(0, 10) },
    { id: "MA-3", meal: "Dinner", served: 574, total: 642, date: new Date().toISOString().slice(0, 10) },
  ],
  fees: [
    { id: "F-1", studentId: "ST-1042", hostelFee: 18000, messFee: 6000, fineAmount: 0, dueAmount: 0, status: "Paid" },
    { id: "F-2", studentId: "ST-1058", hostelFee: 18000, messFee: 6000, fineAmount: 500, dueAmount: 3200, status: "Due" },
    { id: "F-3", studentId: "ST-1183", hostelFee: 22000, messFee: 6500, fineAmount: 0, dueAmount: 0, status: "Paid" },
  ],
  payments: [
    { id: "P-1", studentId: "ST-1042", amount: 24000, method: "UPI", receiptNo: "RCPT-24001", date: new Date().toISOString().slice(0, 10) },
    { id: "P-2", studentId: "ST-1183", amount: 28500, method: "Card", receiptNo: "RCPT-24002", date: new Date().toISOString().slice(0, 10) },
  ],
  complaints: [
    { id: "C-1", studentId: "ST-1042", category: "Water", title: "Water leakage in B block", status: "Pending", priority: "High" },
    { id: "C-2", studentId: "ST-1058", category: "Internet", title: "Wi-Fi outage on 2nd floor", status: "In Progress", priority: "Medium" },
    { id: "C-3", studentId: "ST-1183", category: "Food", title: "Breakfast portion feedback", status: "Resolved", priority: "Low" },
  ],
  notifications: [
    { id: "N-1", title: "Fee due reminder", message: "38 students have pending dues", read: false },
    { id: "N-2", title: "Complaint update", message: "Water leakage escalated to maintenance", read: false },
    { id: "N-3", title: "Menu update", message: "Dinner menu refreshed for the week", read: true },
  ],
  auditLogs: [],
};

function nextId(prefix, collection) {
  return `${prefix}-${String(collection.length + 1).padStart(4, "0")}`;
}

function occupancySummary() {
  const occupiedRooms = state.rooms.filter((room) => room.status === "occupied").length;
  const availableRooms = state.rooms.filter((room) => room.status === "available").length;
  const maintenanceRooms = state.rooms.filter((room) => room.status === "maintenance").length;
  const totalBeds = state.rooms.reduce((sum, room) => sum + room.beds, 0);
  const occupiedBeds = state.rooms.reduce((sum, room) => sum + room.occupiedBeds, 0);

  return {
    totalStudents: state.students.length,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    totalBeds,
    occupiedBeds,
    monthlyRevenue: state.payments.reduce((sum, payment) => sum + payment.amount, 0),
    pendingFees: state.fees.filter((fee) => fee.status === "Due").reduce((sum, fee) => sum + fee.dueAmount, 0),
    todayMeals: state.meals.reduce((sum, meal) => sum + meal.served, 0),
    activeComplaints: state.complaints.filter((complaint) => complaint.status !== "Resolved").length,
  };
}

function recordAudit(action, entity, payload) {
  state.auditLogs.unshift({
    id: nextId("AUD", state.auditLogs),
    action,
    entity,
    payload,
    at: new Date().toISOString(),
  });

  state.auditLogs = state.auditLogs.slice(0, 30);
}

export const campusStore = {
  clone,
  state,
  nextId,
  occupancySummary,
  recordAudit,
};