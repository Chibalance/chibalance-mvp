import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function AssessorFeedbackCard() {
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDocs(
      query(collection(db, "user_missions"), where("userId", "==", user.uid))
    );

    const data = snap.docs
      .map(d => d.data())
      .filter(d => d.feedback);

    setFeedback(data);
  };

  return (
    <div className="feedback-card">

      <h2>Assessor Feedback</h2>

      {feedback.length === 0 ? (
        <p>No feedback yet</p>
      ) : (
        feedback.map((f, i) => (
          <div key={i} className="feedback-item">
            <p><b>{f.missionId}</b></p>
            <p>{f.feedback}</p>
          </div>
        ))
      )}

    </div>
  );
}