import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    sprints: 0,
    missions: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const sprintsSnap = await getDocs(collection(db, "sprints"));
    const missionsSnap = await getDocs(collection(db, "missions"));

    setStats({
      users: usersSnap.size,
      sprints: sprintsSnap.size,
      missions: missionsSnap.size,
    });
  };

return (
  <div className="admin-page">

    <h1>Admin Dashboard</h1>

    <div className="admin-grid">
      <div className="admin-card">
        <h3>Total Users</h3>
        <p style={{ fontSize: "24px", fontWeight: 700 }}>{stats.users}</p>
      </div>

      <div className="admin-card">
        <h3>Total Sprints</h3>
        <p style={{ fontSize: "24px", fontWeight: 700 }}>{stats.sprints}</p>
      </div>

      <div className="admin-card">
        <h3>Total Missions</h3>
        <p style={{ fontSize: "24px", fontWeight: 700 }}>{stats.missions}</p>
      </div>
    </div>

    <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
      <button className="admin-btn primary" onClick={() => navigate("/admin/sprints")}>
        Manage Sprints
      </button>

      <button className="admin-btn primary" onClick={() => navigate("/admin/missions")}>
        Manage Missions
      </button>

      <button className="admin-btn primary" onClick={() => navigate("/admin/users")}>
        View Users
      </button>
    </div>

  </div>
);
}