import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../../components/layout/Logo";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // ✅ NEW
  const [error, setError] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();

    // 🔒 BASIC CONTROL (IMPORTANT)
    if (role === "admin" && !email.endsWith("@admin.com")) {
      setError("Admin accounts must use @admin.com email");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Save user in Firestore WITH ROLE
      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        role, // ✅ ADDED
        createdAt: new Date(),
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError("Failed to create account");
    }
  };

  return (
    <div className="register-page">

      {/* LEFT */}
      <div className="register-left">
        <div className="login-brand">
          <Logo />
          <p className="login-tagline">
            Develop workplace skills through structured learning.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="register-right">
        <form className="register-card" onSubmit={handleRegister}>
          <h2>Create Account</h2>
          <p className="register-sub">Join Skill Sprint today</p>

          {error && <p className="register-error">{error}</p>}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="register-input"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
          />

          {/* ✅ ROLE SELECTOR */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="register-select"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="register-btn">
            Create Account
          </button>

          <p className="register-link">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}