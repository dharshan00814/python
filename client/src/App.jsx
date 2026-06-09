import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ModuleRoutePage from "./pages/ModuleRoutePage.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<ModuleRoutePage moduleKey="students" />} />
          <Route path="hostel" element={<ModuleRoutePage moduleKey="hostel" />} />
          <Route path="mess" element={<ModuleRoutePage moduleKey="mess" />} />
          <Route path="fees" element={<ModuleRoutePage moduleKey="fees" />} />
          <Route path="complaints" element={<ModuleRoutePage moduleKey="complaints" />} />
          <Route path="reports" element={<ModuleRoutePage moduleKey="reports" />} />
          <Route path="settings" element={<ModuleRoutePage moduleKey="settings" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}