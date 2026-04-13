import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import Logo from "./Logo";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="sidebar">
      
      {/* LOGO */}
      <div className="sidebar-top">
        <Logo />
      </div>

      {/* MENU */}
      <ul className="sidebar-menu">

        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
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