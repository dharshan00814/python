import { Router } from "express";

import { campusStore } from "../data/campusStore.js";

export const apiV1Router = Router();

apiV1Router.get("/", (request, response) => {
  void request;

  response.json({
    name: "Hostel & Mess Management API v1",
    resources: [
      "dashboard",
      "students",
      "hostels",
      "rooms",
      "mess/menu",
      "mess/inventory",
      "mess/attendance",
      "fees",
      "payments",
      "complaints",
      "notifications",
      "reports",
    ],
  });
});

apiV1Router.get("/dashboard/summary", (request, response) => {
  void request;

  response.json(campusStore.occupancySummary());
});

apiV1Router.get("/dashboard/activity", (request, response) => {
  void request;

  response.json({
    notifications: campusStore.state.notifications,
    complaints: campusStore.state.complaints,
    auditLogs: campusStore.state.auditLogs,
  });
});

apiV1Router.route("/students")
  .get((request, response) => {
    const { q, department, year } = request.query;
    let items = campusStore.state.students;

    if (q) {
      const query = String(q).toLowerCase();
      items = items.filter((student) => [student.name, student.email, student.room, student.department].some((value) => value.toLowerCase().includes(query)));
    }

    if (department) {
      items = items.filter((student) => student.department === department);
    }

    if (year) {
      items = items.filter((student) => student.year === year);
    }

    response.json({ items: campusStore.clone(items) });
  })
  .post((request, response) => {
    const payload = request.body;
    const createdStudent = {
      id: campusStore.nextId("ST", campusStore.state.students),
      name: payload.name || "New Student",
      email: payload.email || "student@campus.edu",
      department: payload.department || "CSE",
      year: payload.year || "1st Year",
      room: payload.room || "Unassigned",
      attendance: Number(payload.attendance || 0),
      feeStatus: payload.feeStatus || "Due",
      complaintCount: Number(payload.complaintCount || 0),
      emergencyContact: payload.emergencyContact || "",
      photoUrl: payload.photoUrl || "",
    };

    campusStore.state.students.unshift(createdStudent);
    campusStore.recordAudit("create", "student", createdStudent);
    response.status(201).json(createdStudent);
  });

apiV1Router.route("/students/:studentId")
  .get((request, response) => {
    const student = campusStore.state.students.find((item) => item.id === request.params.studentId);
    if (!student) {
      return response.status(404).json({ message: "Student not found" });
    }

    return response.json(student);
  })
  .put((request, response) => {
    const index = campusStore.state.students.findIndex((item) => item.id === request.params.studentId);
    if (index < 0) {
      return response.status(404).json({ message: "Student not found" });
    }

    campusStore.state.students[index] = {
      ...campusStore.state.students[index],
      ...request.body,
    };
    campusStore.recordAudit("update", "student", campusStore.state.students[index]);
    return response.json(campusStore.state.students[index]);
  });

apiV1Router.get("/hostels", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.hostels) });
});

apiV1Router.get("/rooms", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.rooms) });
});

apiV1Router.post("/rooms", (request, response) => {
  const payload = request.body;
  const room = {
    id: payload.id || campusStore.nextId("R", campusStore.state.rooms),
    block: payload.block || "A",
    floor: Number(payload.floor || 1),
    beds: Number(payload.beds || 2),
    occupiedBeds: Number(payload.occupiedBeds || 0),
    status: payload.status || "available",
  };

  campusStore.state.rooms.unshift(room);
  campusStore.recordAudit("create", "room", room);
  response.status(201).json(room);
});

apiV1Router.patch("/rooms/:roomId/status", (request, response) => {
  const room = campusStore.state.rooms.find((item) => item.id === request.params.roomId);
  if (!room) {
    return response.status(404).json({ message: "Room not found" });
  }

  room.status = request.body.status || room.status;
  campusStore.recordAudit("update", "room", room);
  return response.json(room);
});

apiV1Router.get("/mess/menu", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.menu) });
});

apiV1Router.put("/mess/menu/:menuId", (request, response) => {
  const item = campusStore.state.menu.find((entry) => entry.id === request.params.menuId);
  if (!item) {
    return response.status(404).json({ message: "Menu entry not found" });
  }

  Object.assign(item, request.body);
  campusStore.recordAudit("update", "menu", item);
  return response.json(item);
});

apiV1Router.get("/mess/inventory", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.inventory) });
});

apiV1Router.patch("/mess/inventory/:inventoryId", (request, response) => {
  const item = campusStore.state.inventory.find((entry) => entry.id === request.params.inventoryId);
  if (!item) {
    return response.status(404).json({ message: "Inventory item not found" });
  }

  Object.assign(item, request.body);
  campusStore.recordAudit("update", "inventory", item);
  return response.json(item);
});

apiV1Router.get("/mess/attendance", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.meals) });
});

apiV1Router.post("/mess/attendance", (request, response) => {
  const payload = request.body;
  const entry = {
    id: campusStore.nextId("MA", campusStore.state.meals),
    meal: payload.meal || "Breakfast",
    served: Number(payload.served || 0),
    total: Number(payload.total || campusStore.occupancySummary().totalStudents),
    date: payload.date || new Date().toISOString().slice(0, 10),
  };

  campusStore.state.meals.unshift(entry);
  campusStore.recordAudit("create", "meal-attendance", entry);
  response.status(201).json(entry);
});

apiV1Router.get("/fees", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.fees) });
});

apiV1Router.post("/fees", (request, response) => {
  const payload = request.body;
  const fee = {
    id: campusStore.nextId("F", campusStore.state.fees),
    studentId: payload.studentId || "ST-0000",
    hostelFee: Number(payload.hostelFee || 0),
    messFee: Number(payload.messFee || 0),
    fineAmount: Number(payload.fineAmount || 0),
    dueAmount: Number(payload.dueAmount || 0),
    status: payload.status || "Due",
  };

  campusStore.state.fees.unshift(fee);
  campusStore.recordAudit("create", "fee", fee);
  response.status(201).json(fee);
});

apiV1Router.get("/payments", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.payments) });
});

apiV1Router.post("/payments", (request, response) => {
  const payload = request.body;
  const payment = {
    id: campusStore.nextId("P", campusStore.state.payments),
    studentId: payload.studentId || "ST-0000",
    amount: Number(payload.amount || 0),
    method: payload.method || "UPI",
    receiptNo: payload.receiptNo || `RCPT-${Date.now()}`,
    date: payload.date || new Date().toISOString().slice(0, 10),
  };

  campusStore.state.payments.unshift(payment);
  campusStore.recordAudit("create", "payment", payment);
  response.status(201).json(payment);
});

apiV1Router.get("/complaints", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.complaints) });
});

apiV1Router.post("/complaints", (request, response) => {
  const payload = request.body;
  const complaint = {
    id: campusStore.nextId("C", campusStore.state.complaints),
    studentId: payload.studentId || "ST-0000",
    category: payload.category || "Other",
    title: payload.title || "New complaint",
    status: payload.status || "Pending",
    priority: payload.priority || "Medium",
  };

  campusStore.state.complaints.unshift(complaint);
  campusStore.recordAudit("create", "complaint", complaint);
  response.status(201).json(complaint);
});

apiV1Router.patch("/complaints/:complaintId", (request, response) => {
  const complaint = campusStore.state.complaints.find((item) => item.id === request.params.complaintId);
  if (!complaint) {
    return response.status(404).json({ message: "Complaint not found" });
  }

  Object.assign(complaint, request.body);
  campusStore.recordAudit("update", "complaint", complaint);
  return response.json(complaint);
});

apiV1Router.get("/notifications", (request, response) => {
  void request;
  response.json({ items: campusStore.clone(campusStore.state.notifications) });
});

apiV1Router.patch("/notifications/:notificationId/read", (request, response) => {
  const notification = campusStore.state.notifications.find((item) => item.id === request.params.notificationId);
  if (!notification) {
    return response.status(404).json({ message: "Notification not found" });
  }

  notification.read = true;
  campusStore.recordAudit("update", "notification", notification);
  return response.json(notification);
});

apiV1Router.get("/reports/:type", (request, response) => {
  const { type } = request.params;
  const summary = campusStore.occupancySummary();
  const payload = {
    attendance: {
      generatedAt: new Date().toISOString(),
      items: campusStore.state.meals,
      summary,
    },
    fees: {
      generatedAt: new Date().toISOString(),
      items: campusStore.state.payments,
      summary,
    },
    occupancy: {
      generatedAt: new Date().toISOString(),
      items: campusStore.state.rooms,
      summary,
    },
    mess: {
      generatedAt: new Date().toISOString(),
      items: campusStore.state.menu,
      inventory: campusStore.state.inventory,
      summary,
    },
    complaints: {
      generatedAt: new Date().toISOString(),
      items: campusStore.state.complaints,
      summary,
    },
  };

  if (!payload[type]) {
    return response.status(404).json({ message: "Unsupported report type" });
  }

  return response.json(payload[type]);
});
