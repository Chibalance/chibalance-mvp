import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */

type Sprint = {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "in-progress" | "completed";
};

type BasicSprint = {
  id: string;
  title: string;
  description: string;
};

/* ================= COMPONENT ================= */

export default function DashboardPage() {
  const [activeSprints, setActiveSprints] = useState<Sprint[]>([]);
  const [availableSprints, setAvailableSprints] = useState<BasicSprint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSprints();
  }, []);

  /* ================= FETCH ================= */

  const fetchSprints = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      /* USER SPRINTS */
      const userSprintSnap = await getDocs(
        query(collection(db, "user_sprints"), where("userId", "==", user.uid))
      );

      const userSprints = userSprintSnap.docs.map((doc) => doc.data());

      /* ALL SPRINTS */
      const sprintSnap = await getDocs(collection(db, "sprints"));

      const allSprints = sprintSnap.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "",
        description: doc.data().description || "",
      }));

      /* ================= ACTIVE SPRINTS WITH LIVE PROGRESS ================= */

      const active: Sprint[] = await Promise.all(
        userSprints.map(async (us: any) => {
          const sprint = allSprints.find((s) => s.id === us.sprintId);

          /* TOTAL MISSIONS */
          const missionSnap = await getDocs(
            query(
              collection(db, "missions"),
              where("sprintId", "==", us.sprintId)
            )
          );

          const total = missionSnap.size;

          /* COMPLETED MISSIONS */
          const completedSnap = await getDocs(
            query(
              collection(db, "user_missions"),
              where("userId", "==", user.uid),
              where("sprintId", "==", us.sprintId),
              where("status", "==", "passed")
            )
          );

          const completed = completedSnap.size;

          const progress =
            total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            id: us.sprintId,
            title: sprint?.title || "Untitled Sprint",
            description: sprint?.description || "",
            progress,
            status: progress === 100 ? "completed" : "in-progress",
          };
        })
      );

      /* ================= AVAILABLE SPRINTS ================= */

      const available: BasicSprint[] = allSprints.filter(
        (s) => !userSprints.some((us: any) => us.sprintId === s.id)
      );

      setActiveSprints(active);
      setAvailableSprints(available);

    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  /* ================= JOIN SPRINT ================= */

  const joinSprint = async (sprintId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    /* CREATE USER SPRINT */
    await setDoc(doc(db, "user_sprints", `${user.uid}_${sprintId}`), {
      userId: user.uid,
      sprintId,
      progress: 0,
      status: "in-progress",
      createdAt: new Date(),
    });

    /* 🔥 GET MISSIONS OF THIS SPRINT */
    const missionSnap = await getDocs(
      query(collection(db, "missions"), where("sprintId", "==", sprintId))
    );

    /* 🔥 CREATE USER_MISSIONS FOR EACH */
    const promises = missionSnap.docs.map((m) => {
      return setDoc(
        doc(db, "user_missions", `${user.uid}_${m.id}`),
        {
          userId: user.uid,
          missionId: m.id,
          sprintId,
          status: "not-started",
          score: 0,
          attempts: 0,
          createdAt: new Date(),
        }
      );
    });

    await Promise.all(promises);

    fetchSprints();
  };

  /* ================= UI ================= */

  return (
    <div className="dashboard-page">

      <div className="dashboard-grid">

        {/* LEFT */}
        <div className="dashboard-left">

          {/* HEADER */}
          <div className="dashboard-header">
            <h1>Welcome back</h1>
            <p>Continue your Skill Sprint journey.</p>
          </div>

          {/* ACTIVE SPRINTS */}
          <div>
            <h2 className="dashboard-section-title">
              Your Active Sprints
            </h2>

            <div className="dashboard-cards">
              {activeSprints.length > 0 ? (
                activeSprints.map((s) => (
                  <div key={s.id} className="dashboard-card">

                    <h3>{s.title}</h3>
                    <p>{s.description}</p>

                    <div className="dashboard-progress-bar">
                      <div
                        className="dashboard-progress-fill"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>

                    <p className="dashboard-progress-text">
                      {s.progress}% complete
                    </p>

                    <button
                      className="dashboard-btn"
                      onClick={() => navigate(`/sprint/${s.id}`)}
                    >
                      Continue Sprint
                    </button>

                  </div>
                ))
              ) : (
                <p>No active sprints yet.</p>
              )}
            </div>
          </div>

          {/* AVAILABLE SPRINTS */}
          <div style={{ marginTop: "30px" }}>
            <h2 className="dashboard-section-title">
              Available Sprints
            </h2>

            <div className="dashboard-cards">
              {availableSprints.length > 0 ? (
                availableSprints.map((s) => (
                  <div key={s.id} className="dashboard-card">

                    <h3>{s.title}</h3>
                    <p>{s.description}</p>

                    <button
                      className="dashboard-btn"
                      onClick={() => joinSprint(s.id)}
                    >
                      Join Sprint
                    </button>

                  </div>
                ))
              ) : (
                <p>No new sprints available.</p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="dashboard-right">

          <div className="dashboard-panel">
            <h3>Progress Summary</h3>

            <div className="dashboard-progress-bar">
              <div
                className="dashboard-progress-fill"
                style={{ width: "40%" }}
              />
            </div>

            <div className="dashboard-stats">
              <p>Active Sprints: {activeSprints.length}</p>
              <p>Badges Earned: 5</p>
              <p>Learning Streak: 12 days</p>
            </div>
          </div>

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