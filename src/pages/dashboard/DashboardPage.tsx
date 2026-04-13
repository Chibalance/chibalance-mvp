import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */
type Sprint = {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "in-progress" | "completed";
};

export default function DashboardPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSprints();
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchSprints = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      /* USER SPRINTS */
      const userSprintSnap = await getDocs(
        query(
          collection(db, "user_sprints"),
          where("userId", "==", user.uid)
        )
      );

      const userSprints = userSprintSnap.docs.map((doc) => {
        const data = doc.data() as any;

        return {
          sprintId: data.sprintId,
          progress: data.progress || 0,
          status: data.status || "in-progress",
        };
      });

      /* ALL SPRINTS */
      const sprintSnap = await getDocs(collection(db, "sprints"));

      const allSprints = sprintSnap.docs.map((doc) => {
        const data = doc.data() as any;

        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
        };
      });

      /* MERGE */
      const merged: Sprint[] = userSprints.map((us) => {
        const sprint = allSprints.find((s) => s.id === us.sprintId);

        return {
          id: us.sprintId,
          title: sprint?.title || "Untitled Sprint",
          description: sprint?.description || "",
          progress: us.progress,
          status: us.status === "completed" ? "completed" : "in-progress",
        };
      });

      setSprints(merged);

    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="dashboard-page">

      <div className="dashboard-grid">

        {/* LEFT SECTION */}
        <div className="dashboard-left">

          {/* HEADER */}
          <div className="dashboard-header">
            <h1>Welcome back</h1>
            <p>Continue your Skill Sprint journey.</p>
          </div>

          {/* SPRINTS */}
          <div>
            <h2 className="dashboard-section-title">
              Your Active Sprints
            </h2>

            <div className="dashboard-cards">
              {sprints.length > 0 ? (
                sprints.map((s) => (
                  <div key={s.id} className="dashboard-card">

                    <h3>{s.title}</h3>
                    <p>{s.description}</p>

                    {/* PROGRESS */}
                    <div className="dashboard-progress-bar">
                      <div
                        className="dashboard-progress-fill"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>

                    <p className="dashboard-progress-text">
                      {s.progress}% complete
                    </p>

                    {/* BUTTON */}
                    <button
                      className="dashboard-btn"
                      onClick={() => navigate(`/sprint/${s.id}`)}
                    >
                      Continue Sprint
                    </button>

                  </div>
                ))
              ) : (
                <p>No active sprints found.</p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SECTION */}
        <div className="dashboard-right">

          {/* PROGRESS SUMMARY */}
          <div className="dashboard-panel">
            <h3>Progress Summary</h3>

            <div className="dashboard-progress-bar">
              <div
                className="dashboard-progress-fill"
                style={{ width: "40%" }}
              />
            </div>

            <div className="dashboard-stats">
              <p>Active Sprints: {sprints.length}</p>
              <p>Badges Earned: 5</p>
              <p>Learning Streak: 12 days</p>
            </div>
          </div>

          {/* ACTIVITY STATUS */}
          <div className="dashboard-panel">
            <h3>Activity Status</h3>

            <div className="status yellow">
              Evidence Submitted
            </div>

            <div className="status orange">
              Assessment Pending
            </div>

            <div className="status red">
              Retry Required
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}