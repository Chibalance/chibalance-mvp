import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

/* ================= TYPES ================= */

type SprintProgress = {
  sprintId: string;
  sprintTitle: string;
  progress: number;
  status: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  sprints: SprintProgress[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, roleFilter, activityFilter]);

  /* ================= FETCH ================= */

  const fetchData = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const sprintSnap = await getDocs(collection(db, "user_sprints"));
    const sprintMasterSnap = await getDocs(collection(db, "sprints"));

    /* 🔹 MAP SPRINT TITLES */
    const sprintTitleMap: any = {};
    sprintMasterSnap.docs.forEach((doc) => {
      sprintTitleMap[doc.id] = doc.data().title;
    });

    /* 🔹 MAP USER PROGRESS */
    const progressMap: any = {};
    sprintSnap.docs.forEach((doc) => {
      const d = doc.data();

      if (!progressMap[d.userId]) {
        progressMap[d.userId] = [];
      }

      progressMap[d.userId].push({
        sprintId: d.sprintId,
        sprintTitle: sprintTitleMap[d.sprintId] || "Untitled",
        progress: d.progress,
        status: d.status,
      });
    });

    /* 🔹 MERGE USERS */
    const merged: User[] = usersSnap.docs.map((doc) => {
      const u = doc.data();

      return {
        id: doc.id,
        name: u.name,
        email: u.email,
        role: u.role || "user",
        sprints: progressMap[doc.id] || [],
      };
    });

    setUsers(merged);
  };

  /* ================= FILTER ================= */

  const applyFilters = () => {
    let data = [...users];

    if (search.trim()) {
      data = data.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((u) => u.role === roleFilter);
    }

    if (activityFilter === "active") {
      data = data.filter((u) => u.sprints.length > 0);
    }

    if (activityFilter === "inactive") {
      data = data.filter((u) => u.sprints.length === 0);
    }

    setFiltered(data);
  };

  /* ================= UI ================= */

  return (
    <div className="admin-page">

      <h1>Users & Progress</h1>

      {/* 🔍 FILTER BAR */}
      <div className="admin-form">
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}>
          <option value="all">All Activity</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* 👥 USERS */}
      <div className="admin-grid">

        {filtered.map((u) => (
          <div key={u.id} className="admin-card clickable" onClick={() => setSelectedUser(u)}>

            <h3>{u.name}</h3>
            <p className="muted">{u.email}</p>

            <div className="user-meta">
              <span className={`badge ${u.role}`}>{u.role}</span>
              <span>{u.sprints.length} sprints</span>
            </div>

            {/* MINI PROGRESS */}
            {u.sprints.length > 0 && (
              <div className="mini-progress">
                {u.sprints.map((s, i) => (
                  <div key={i} className="mini-bar">
                    <div style={{ width: `${s.progress}%` }} />
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}

      </div>

      {/* 🔥 USER DETAIL MODAL */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h2>{selectedUser.name}</h2>
            <p className="muted">{selectedUser.email}</p>

            <h4>Progress</h4>

            {selectedUser.sprints.length > 0 ? (
              selectedUser.sprints.map((s, i) => (
                <div key={i} className="progress-item">
                  <p>{s.sprintTitle}</p>

                  <div className="progress-bar">
                    <div style={{ width: `${s.progress}%` }} />
                  </div>

                  <span>{s.progress}%</span>
                </div>
              ))
            ) : (
              <p>No activity yet</p>
            )}

          </div>
        </div>
      )}

    </div>
  );
}