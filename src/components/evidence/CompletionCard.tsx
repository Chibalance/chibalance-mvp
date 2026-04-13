import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import jsPDF from "jspdf";

export default function CompletionCard() {
  const [completed, setCompleted] = useState(false);
  const [total, setTotal] = useState(0);
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    fetchCompletion();
  }, []);

  const handleDownload = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Skill Sprint Evidence Pack", 20, 20);

  doc.setFontSize(12);
  doc.text(`User: ${user.email}`, 20, 40);
  doc.text(`Completed Missions: ${passed}/${total}`, 20, 50);

  doc.text("Achievements:", 20, 70);
  doc.text("- Communication Skills", 25, 80);
  doc.text("- Leadership Development", 25, 90);

  doc.save("SkillSprint_Evidence_Pack.pdf");
};

const fetchCompletion = async () => {
  const user = auth.currentUser;
  if (!user) return;

  /* MISSIONS (for progress bar only) */
  const missionsSnap = await getDocs(collection(db, "missions"));
  const totalMissions = missionsSnap.size;

  const userMissionSnap = await getDocs(
    query(collection(db, "user_missions"), where("userId", "==", user.uid))
  );

  const passedMissions = userMissionSnap.docs.filter(
    (d) => d.data().status === "passed"
  ).length;

  setTotal(totalMissions);
  setPassed(passedMissions);

  /* ✅ NEW: CHECK COMPLETED SPRINT */
  const sprintSnap = await getDocs(
    query(
      collection(db, "user_sprints"),
      where("userId", "==", user.uid),
      where("status", "==", "completed")
    )
  );

  setCompleted(sprintSnap.size > 0);
};

  return (
    <div className="completion-wrapper">

      {/* HEADER */}
      <div className="completion-header">
        <div className={`completion-icon ${completed ? "success" : ""}`}>
          {completed ? "✅" : "⏳"}
        </div>

        <h1>
          {completed ? "Sprint Completed!" : "In Progress"}
        </h1>

        <p>
          {completed
            ? "Your competency evidence pack is ready."
            : "Complete all missions to unlock your evidence pack."}
        </p>
      </div>

      {/* CARD */}
      <div className="completion-card">

        <h2>Evidence Pack</h2>

        {/* CONTENT */}
        <div className="completion-list">
          <div className="completion-item">
            <span>Reflection Document</span>
            <span>✓</span>
          </div>

          <div className="completion-item">
            <span>Communication Analysis</span>
            <span>✓</span>
          </div>

          <div className="completion-item">
            <span>Leadership Action Plan</span>
            <span>✓</span>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="completion-progress">
          <p>{passed} / {total} missions completed</p>

          <div className="bar">
            <div style={{ width: `${(passed / total) * 100 || 0}%` }} />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="completion-actions">

        <button
        className="primary"
        onClick={handleDownload}
        disabled={!completed}
        >
        Download Evidence Pack
        </button>

          <button className="secondary">
            Share With Employer
          </button>

        </div>
        {!completed && (
          <p className="completion-hint">
            Complete a sprint to unlock your evidence pack
          </p>
        )}
      </div>

    </div>
  );
}