import { Routes, Route, Navigate } from "react-router-dom";

/* AUTH */
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

/* LAYOUT */
import MainLayout from "./components/layout/MainLayout";

/* CORE PAGES */
import DashboardPage from "./pages/dashboard/DashboardPage";
import SprintDetailsPage from "./pages/sprints/SprintDetailsPage";
import MissionPage from "./pages/missions/MissionPage";

/* NEW PAGES */
import MySprintsPage from "./pages/sprints/MySprintsPage";
import ProgressPage from "./pages/progress/ProgressPage";
import EvidencePackPage from "./pages/evidence/EvidencePackPage";
import ProfilePage from "./pages/profile/ProfilePage";

/* Admin Pages */
import AdminRoute from "./routes/AdminRoute";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ManageMissionsPage from "./pages/admin/ManageMissionsPage";
import ManageSprintsPage from "./pages/admin/ManageSprintsPage";
import UsersPage from "./pages/admin/UsersPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";


export default function App() {
  return (
    <Routes>

      {/* ================= AUTH (NO LAYOUT) ================= */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ================= APP (WITH SIDEBAR + HEADER) ================= */}
      <Route element={<MainLayout />}>

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* SPRINT FLOW */}
        <Route path="/sprint/:sprintId" element={<SprintDetailsPage />} />
        <Route path="/mission/:missionId" element={<MissionPage />} />

        {/* NEW SIDEBAR PAGES */}
        <Route path="/my-sprints" element={<MySprintsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/evidence-pack" element={<EvidencePackPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/sprints"
          element={
            <AdminRoute>
              <ManageSprintsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/missions"
          element={
            <AdminRoute>
              <ManageMissionsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminProfilePage />
            </AdminRoute>
          }
        />

      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}