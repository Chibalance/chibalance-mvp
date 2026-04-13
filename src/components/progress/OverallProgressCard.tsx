import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function OverallProgressCard() {
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    inProgress: 0,
    failed: 0,
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

    let passed = 0, inProgress = 0, failed = 0;

    snap.docs.forEach(d => {
      const s = d.data().status;
      if (s === "passed") passed++;
      else if (s === "failed") failed++;
      else inProgress++;
    });

    setStats({
      total: snap.size,
      passed,
      inProgress,
      failed,
    });
  };

  const progress = stats.total
    ? Math.round((stats.passed / stats.total) * 100)
    : 0;

  return (
    <div className="overall-card">

      <h2>Overall Progress</h2>

      <div className="overall-bar">
        <div style={{ width: `${progress}%` }} />
      </div>

      <p>{progress}% Complete</p>

      <div className="overall-stats">
        <div><b>{stats.passed}</b><span>Passed</span></div>
        <div><b>{stats.inProgress}</b><span>In Progress</span></div>
        <div><b>{stats.failed}</b><span>Failed</span></div>
        <div><b>{stats.total}</b><span>Total</span></div>
      </div>

    </div>
  );
}