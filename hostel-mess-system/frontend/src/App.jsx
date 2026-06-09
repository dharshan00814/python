import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import StudentRegistration from './pages/StudentRegistration.jsx';
import RoomAllocation from './pages/RoomAllocation.jsx';
import MessPlanManagement from './pages/MessPlanManagement.jsx';
import BillingPage from './pages/BillingPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import { getToken, isAdmin } from './services/auth.js';

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = getToken();
    setAuthed(Boolean(t) && isAdmin(t));
    setReady(true);
  }, []);

  if (!ready) return <div className="p-6 text-slate-200">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={authed ? <Dashboard /> : <AdminLogin />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/students"
        element={authed ? <StudentRegistration /> : <Navigate to="/" replace />}
      />
      <Route
        path="/rooms"
        element={authed ? <RoomAllocation /> : <Navigate to="/" replace />}
      />
      <Route
        path="/mess"
        element={authed ? <MessPlanManagement /> : <Navigate to="/" replace />}
      />
      <Route
        path="/billing"
        element={authed ? <BillingPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

