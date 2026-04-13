import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { updatePassword } from "firebase/auth";

import { User, Mail, Lock, Bell, BookOpen, Award } from "lucide-react";

type UserProfile = {
  name: string;
  email: string;
};

export default function ProfilePage() {
  const user = auth.currentUser;

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
  });

  const [stats, setStats] = useState({
    sprintsCompleted: 0,
    certificates: 0,
    hours: 0,
    badges: 0,
    streak: 0,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weeklyReport: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
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
    } else {
      setProfile({
        name: "",
        email: user.email || "",
      });
    }
  };

  /* ================= FETCH STATS ================= */

  const fetchStats = async () => {
    if (!user) return;

    const sprintSnap = await getDocs(
      query(
        collection(db, "user_sprints"),
        where("userId", "==", user.uid),
        where("status", "==", "completed")
      )
    );

    const missionSnap = await getDocs(
      query(collection(db, "user_missions"), where("userId", "==", user.uid))
    );

    setStats({
      sprintsCompleted: sprintSnap.size,
      certificates: sprintSnap.size,
      hours: missionSnap.size * 2,
      badges: missionSnap.size,
      streak: Math.min(missionSnap.size, 30),
    });
  };

  /* ================= SAVE PROFILE ================= */

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
    } catch (err) {
      alert("Error updating password");
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-container">

        {/* HEADER */}
        <div className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account settings and preferences.</p>
        </div>

        {/* USER INFO */}
        <div className="profile-card">

          <h2>User Information</h2>

          <div className="profile-info">

            <div className="profile-avatar">
              <User size={40} />
            </div>

            <div className="profile-fields">

              <input
                value={profile.name}
                placeholder="Full Name"
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

        {/* STATS */}
        <div className="profile-card">

          <h2>Learning Statistics</h2>

          <div className="profile-stats">

            <div className="stat-box">
              <BookOpen />
              <div>
                <h3>{stats.sprintsCompleted}</h3>
                <p>Sprints Completed</p>
              </div>
            </div>

            <div className="stat-box">
              <Award />
              <div>
                <h3>{stats.certificates}</h3>
                <p>Certificates</p>
              </div>
            </div>

          </div>

          <div className="profile-extra-stats">
            <div>
              <h3>{stats.hours}</h3>
              <p>Hours Learned</p>
            </div>

            <div>
              <h3>{stats.badges}</h3>
              <p>Badges</p>
            </div>

            <div>
              <h3>{stats.streak}</h3>
              <p>Day Streak</p>
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