import { NavLink, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function Sidebar() {

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || "user"); // ✅ fallback
        } else {
          setRole("user"); // ✅ fallback if no doc
        }

      } catch (err) {
        console.error("Role fetch error");
        setRole("user"); // ✅ safety fallback
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);

    // 🔥 Force full reset
    window.location.href = "/";
  };

  // 🔴 IMPORTANT: WAIT UNTIL ROLE IS KNOWN
  if (loading) return null;

  return (
    <div className="sidebar">

      {/* LOGO */}
      <div className="sidebar-top">
        <Logo />
      </div>

      {/* MENU */}
      <ul className="sidebar-menu">

        {/* USER MENU */}
        {role === "user" && (
          <>
            <li>
              <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "active" : ""}>
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/my-sprints" className={({ isActive }) => isActive ? "active" : ""}>
                My Sprints
              </NavLink>
            </li>

            <li>
              <NavLink to="/progress" className={({ isActive }) => isActive ? "active" : ""}>
                Progress
              </NavLink>
            </li>

            <li>
              <NavLink to="/evidence-pack" className={({ isActive }) => isActive ? "active" : ""}>
                Evidence Pack
              </NavLink>
            </li>

            <li>
              <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                Profile
              </NavLink>
            </li>
          </>
        )}

        {/* ADMIN MENU */}
        {role === "admin" && (
          <>
            <li>
              <NavLink to="/admin" end className={({ isActive }) => isActive ? "active" : ""}>
                Admin Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/sprints" className={({ isActive }) => isActive ? "active" : ""}>
                Manage Sprints
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/missions" className={({ isActive }) => isActive ? "active" : ""}>
                Manage Missions
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? "active" : ""}>
                Users & Progress
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/profile" className={({ isActive }) => isActive ? "active" : ""}>
                Profile
              </NavLink>
            </li>
          </>
        )}

      </ul>

      {/* LOGOUT */}
      <div className="sidebar-bottom">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

    </div>
  );
}
