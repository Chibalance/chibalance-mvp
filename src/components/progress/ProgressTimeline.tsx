import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ProgressTimeline() {
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    fetchTimeline();
  }, []);

const fetchTimeline = async () => {
  const user = auth.currentUser;
  if (!user) return;

  /* USER MISSIONS */
  const userSnap = await getDocs(
    query(collection(db, "user_missions"), where("userId", "==", user.uid))
  );

  const userMissions = userSnap.docs.map(doc => doc.data());

  /* ALL MISSIONS */
  const missionSnap = await getDocs(collection(db, "missions"));

  const allMissions = missionSnap.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title,
  }));

  /* MERGE */
  const merged = userMissions.map((um: any) => {
    const mission = allMissions.find(m => m.id === um.missionId);

    return {
      missionId: um.missionId,
      title: mission?.title || "Untitled Mission",
      status: um.status,
    };
  });

  setMissions(merged);
};

  return (
    <div className="timeline-card">

      <h2>Mission Timeline</h2>

      <div className="timeline-list">
        {missions.map((m, i) => (
          <div key={i} className={`timeline-item ${m.status}`}>
            <h4>{m.title}</h4>
            <p>Status: {m.status}</p>
          </div>
        ))}
      </div>

    </div>
  );
}