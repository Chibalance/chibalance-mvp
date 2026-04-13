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

      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}