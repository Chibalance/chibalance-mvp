import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import Logo from "../../components/layout/Logo";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleLogin = async (e: any) => {
  e.preventDefault();

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    const user = res.user;

    // ✅ GET USER ROLE FROM FIRESTORE
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      throw new Error("User data not found");
    }

    const role = snap.data().role;

    // ✅ ROUTE BASED ON ROLE
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }

  } catch (err: any) {
    console.log("ERROR:", err.code, err.message);
    setError("Invalid email or password");
  }
};

  return (
    <div className="login-page">
      
      {/* LEFT */}
      <div className="login-left">
        <div className="login-brand">
          <Logo />
          <p className="login-tagline">
            Develop workplace skills through structured learning.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p className="login-sub">Sign in to continue</p>

          {error && <p className="login-error">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="login-link">
            Don’t have an account? <Link to="/register">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}