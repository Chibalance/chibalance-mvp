import { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Header() {
  const [name, setName] = useState("User");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        const username = user.email.split("@")[0];
        setName(username);
      }
    });

    return () => unsub();
  }, []);

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="header">

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search sprints, missions..."
        className="header-search"
      />

      {/* USER */}
      <div className="header-user">
        <div className="user-avatar">{initials}</div>
        <span className="user-name">{name}</span>
      </div>

    </div>
  );
}