import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function AchievementSummaryPanel() {
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDocs(
      query(collection(db, "user_missions"), where("userId", "==", user.uid))
    );

    let total = snap.size;
    let passed = 0;
    let totalScore = 0;

    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.status === "passed") passed++;
      totalScore += data.score || 0;
    });

    setStats({
      total,
      passed,
      avgScore: total ? (totalScore / total).toFixed(1) as any : 0,
    });
  };

  return (
    <div className="achievement-panel">

      {/* ACHIEVEMENTS */}
      <div className="achievement-card">
        <h3>Achievements</h3>

        <div className="achievement-item">
          🏆 Sprint Progress: {stats.passed}/{stats.total}
        </div>

        <div className="achievement-item">
          ⭐ Avg Score: {stats.avgScore}
        </div>
      </div>

      {/* STATS */}
      <div className="achievement-card">
        <h3>Statistics</h3>

        <div className="stat">
          <span>Total Missions</span>
          <b>{stats.total}</b>
        </div>

        <div className="stat">
          <span>Completed</span>
          <b>{stats.passed}</b>
        </div>
      </div>

      {/* NEXT */}
      <div className="achievement-card highlight">
        <h4>🚀 What's Next?</h4>
        <p>Unlock advanced sprints after completion.</p>
      </div>

    </div>
  );
}