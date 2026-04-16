import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { updatePassword } from "firebase/auth";

import { User, Mail, Lock, Bell, BookOpen, Users } from "lucide-react";

type AdminProfile = {
  name: string;
  email: string;
};

export default function AdminProfilePage() {
  const user = auth.currentUser;

  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
  });

  const [stats, setStats] = useState({
    totalSprints: 0,
    totalMissions: 0,
    totalUsers: 0,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    systemAlerts: true,
  });

  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  /* ================= FETCH PROFILE ================= */

  const fetchProfile = async () => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as any;

      setProfile({
        name: data.name || "",
        email: user.email || "",
      });

      setNotifications(data.notifications || notifications);
    }
  };

  /* ================= FETCH ADMIN STATS ================= */

  const fetchStats = async () => {
    const sprintSnap = await getDocs(collection(db, "sprints"));
    const missionSnap = await getDocs(collection(db, "missions"));
    const userSnap = await getDocs(collection(db, "users"));

    setStats({
      totalSprints: sprintSnap.size,
      totalMissions: missionSnap.size,
      totalUsers: userSnap.size,
    });
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    await setDoc(
      doc(db, "users", user.uid),
      {
        name: profile.name,
        notifications,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    setLoading(false);
    alert("Profile updated");
  };

  /* ================= PASSWORD ================= */

  const handlePasswordUpdate = async () => {
    if (!user) return;

    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await updatePassword(user, passwords.new);
      alert("Password updated");
    } catch {
      alert("Error updating password");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* HEADER */}
        <div className="profile-header">
          <h1>Admin Profile</h1>
          <p>Manage admin account and system overview.</p>
        </div>

        {/* USER INFO */}
        <div className="profile-card">

          <h2>Admin Information</h2>

          <div className="profile-info">

            <div className="profile-avatar">
              <User size={40} />
            </div>

            <div className="profile-fields">

              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />

              <div className="input-icon">
                <Mail size={16} />
                <input value={profile.email} disabled />
              </div>

              <button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>

            </div>
          </div>
        </div>

        {/* ADMIN STATS */}
        <div className="profile-card">

          <h2>System Overview</h2>

          <div className="profile-stats">

            <div className="stat-box">
              <BookOpen />
              <div>
                <h3>{stats.totalSprints}</h3>
                <p>Total Sprints</p>
              </div>
            </div>

            <div className="stat-box">
              <BookOpen />
              <div>
                <h3>{stats.totalMissions}</h3>
                <p>Total Missions</p>
              </div>
            </div>

            <div className="stat-box">
              <Users />
              <div>
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

          </div>

        </div>

        {/* SETTINGS */}
        <div className="profile-card">

          <h2>Settings</h2>

          {/* PASSWORD */}
          <div className="profile-section">

            <div className="section-title">
              <Lock size={18} />
              <h3>Change Password</h3>
            </div>

            <input
              type="password"
              placeholder="New Password"
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />

            <button onClick={handlePasswordUpdate}>
              Update Password
            </button>

          </div>

          {/* NOTIFICATIONS */}
          <div className="profile-section">

            <div className="section-title">
              <Bell size={18} />
              <h3>Notifications</h3>
            </div>

            {Object.keys(notifications).map((key) => (
              <div key={key} className="toggle-row">
                <span>{key}</span>

                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [key]: e.target.checked,
                    })
                  }
                />
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}