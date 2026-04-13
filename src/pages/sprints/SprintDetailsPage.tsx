import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../services/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

/* ================= TYPES ================= */

type Mission = {
  id: string;
  title: string;
  type: "quiz" | "artefact";
  instructions: string[];
  order?: number;
  status?: string;
};

type Sprint = {
  id: string;
  title: string;
  description: string;
};

export default function SprintDetailsPage() {
  const { sprintId } = useParams();
  const navigate = useNavigate();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    if (sprintId) {
      fetchSprint();
      fetchMissions();
    }
  }, [sprintId]);

  const fetchSprint = async () => {
    const sprintRef = doc(db, "sprints", sprintId!);
    const sprintSnap = await getDoc(sprintRef);

    if (sprintSnap.exists()) {
      const data = sprintSnap.data() as any;

      setSprint({
        id: sprintSnap.id,
        title: data.title,
        description: data.description,
      });
    }
  };

  const fetchMissions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const missionSnap = await getDocs(
      query(collection(db, "missions"), where("sprintId", "==", sprintId))
    );

    const userSnap = await getDocs(
      query(
        collection(db, "user_missions"),
        where("userId", "==", user.uid),
        where("sprintId", "==", sprintId)
      )
    );

    const userMap: any = {};
    userSnap.docs.forEach((d) => {
      userMap[d.data().missionId] = d.data();
    });

    const missionList: Mission[] = missionSnap.docs.map((doc, index) => {
      const data = doc.data() as any;

      return {
        id: doc.id,
        title: data.title,
        type: data.type,
        instructions: data.instructions || [],
        order: data.order ?? index,
        status: userMap[doc.id]?.status || "not-started",
      };
    });

    missionList.sort((a, b) => (a.order || 0) - (b.order || 0));

    setMissions(missionList);
  };

  const isLocked = (index: number) => {
    if (index === 0) return false;
    return missions[index - 1].status !== "passed";
  };

  return (
    <div className="sprint-page">

      <div className="sprint-header">
        <h1>{sprint?.title}</h1>
        <p>{sprint?.description}</p>
      </div>

      <div>
        <h2 className="sprint-section-title">Missions</h2>

        <div className="sprint-missions">
          {missions.map((m, index) => {
            const locked = isLocked(index);

            return (
              <div key={m.id} className="sprint-card">

                <h3>{m.title}</h3>

                <p className="sprint-type">
                  {locked
                    ? "🔒 Locked"
                    : m.status === "passed"
                    ? "✅ Completed"
                    : m.status === "in-progress"
                    ? "⏳ Resume"
                    : "▶ Start"}
                </p>

                <ul className="sprint-instructions">
                  {m.instructions.slice(0, 2).map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>

                <button
                  className="sprint-btn"
                  disabled={locked}
                  onClick={() => navigate(`/mission/${m.id}`)}
                >
                  {locked
                    ? "Locked"
                    : m.status === "in-progress"
                    ? "Resume Mission"
                    : m.status === "passed"
                    ? "Review"
                    : "Start Mission"}
                </button>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}