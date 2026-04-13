import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc, // ✅ ADD THIS
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

/* ================= TYPES ================= */

type Question = {
  question: string;
  options: string[];
  answer: string;
};

type Mission = {
  id: string;
  title: string;
  type: "quiz" | "artefact" | "content" | "video" | "pdf";
  sprintId: string;
  instructions?: string[];
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  questions?: Question[];
  passRule?: string;
  maxRetries?: number;
};

export default function MissionPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Mission | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [textAnswer, setTextAnswer] = useState("");
  const [result, setResult] = useState<"idle" | "success" | "fail">("idle");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (missionId) fetchMission();
  }, [missionId]);

  /* ================= FETCH ================= */

  const fetchMission = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "missions", missionId!);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as any;

      setMission({
        id: snap.id,
        title: data.title,
        type: data.type,
        sprintId: data.sprintId,
        instructions: data.instructions || [],
        content: data.content || "",
        videoUrl: data.videoUrl || "",
        pdfUrl: data.pdfUrl || "",
        questions: data.questions || [],
        passRule: data.passRule || "",
        maxRetries: data.maxRetries || 0,
      });
    }

    // 🔥 LOAD USER STATE
    const userRef = doc(db, "user_missions", `${user.uid}_${missionId}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const u = userSnap.data() as any;

      setAttempts(u.attempts || 0);
      setScore(u.score || 0);

      if (u.answer) {
        if (typeof u.answer === "string") setTextAnswer(u.answer);
        else setAnswers(u.answer);
      }

      if (u.status === "passed") {
        setLocked(true);
        setResult("success");
      }
    }
  };

  /* ================= HELPERS ================= */

  const getRequiredCorrect = () => {
    if (!mission?.passRule) return 0;
    return parseInt(mission.passRule.split("/")[0]);
  };

  /* ================= FIREBASE ================= */

  const updateUserMission = async (
    status: string,
    score: number,
    attempts: number
  ) => {
    const user = auth.currentUser;
    if (!user || !mission) return;

    const ref = doc(db, "user_missions", `${user.uid}_${mission.id}`);

    await setDoc(ref, {
      userId: user.uid,
      missionId: mission.id,
      sprintId: mission.sprintId,
      status,
      score,
      attempts,
      answer: mission.type === "artefact" ? textAnswer : answers,
      updatedAt: new Date(),
    });
  };

const updateSprintProgress = async () => {
  const user = auth.currentUser;
  if (!user || !mission) return;

  /* TOTAL MISSIONS */
  const missionSnap = await getDocs(
    query(collection(db, "missions"), where("sprintId", "==", mission.sprintId))
  );

  const total = missionSnap.size;

  /* PASSED MISSIONS */
  const userMissionSnap = await getDocs(
    query(
      collection(db, "user_missions"),
      where("userId", "==", user.uid),
      where("sprintId", "==", mission.sprintId),
      where("status", "==", "passed")
    )
  );

  const completed = userMissionSnap.size;
  const progress = Math.round((completed / total) * 100);

  /* 🔥 FIND EXISTING USER SPRINT */
  const existingSnap = await getDocs(
    query(
      collection(db, "user_sprints"),
      where("userId", "==", user.uid),
      where("sprintId", "==", mission.sprintId)
    )
  );

  if (!existingSnap.empty) {
    // ✅ UPDATE EXISTING (NO DUPLICATE)
    const docRef = existingSnap.docs[0].ref;

    await updateDoc(docRef, {
      progress,
      status: progress === 100 ? "completed" : "in-progress",
      updatedAt: new Date(),
    });

  } else {
    // ✅ CREATE ONLY IF DOESN’T EXIST
    await setDoc(doc(db, "user_sprints", `${user.uid}_${mission.sprintId}`), {
      userId: user.uid,
      sprintId: mission.sprintId,
      progress,
      status: progress === 100 ? "completed" : "in-progress",
      updatedAt: new Date(),
    });
  }
};

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!mission || locked) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // ✅ VALIDATION
    if (mission.type === "quiz") {
      const allAnswered = mission.questions?.every((_, i) => answers[i]);
      if (!allAnswered) {
        alert("Please answer all questions");
        return;
      }
    }

    if (mission.type === "artefact") {
      if (!textAnswer.trim()) {
        alert("Please write your answer");
        return;
      }
    }

    /* ===== QUIZ ===== */
    if (mission.type === "quiz" && mission.questions) {
      let correct = 0;

      mission.questions.forEach((q, index) => {
        if (answers[index] === q.answer) correct++;
      });

      setScore(correct);

      if (correct >= getRequiredCorrect()) {
        setResult("success");
        setLocked(true);

        await updateUserMission("passed", correct, newAttempts);
        await updateSprintProgress();
      } else {
        setResult("fail");

        await updateUserMission(
          newAttempts >= (mission.maxRetries || 1)
            ? "failed"
            : "in-progress",
          correct,
          newAttempts
        );
      }
    }

    /* ===== NON QUIZ ===== */
    else {
      setResult("success");
      setLocked(true);

      await updateUserMission("passed", 1, newAttempts);
      await updateSprintProgress();
    }
  };

  /* ================= UI ================= */

  if (!mission) return <p>Loading...</p>;

  if (result === "success") {
    return (
      <div className="mission-result success">
        <h1>✅ Mission Passed</h1>
        <p>Score: {score} / {mission.questions?.length || 1}</p>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (result === "fail") {
    return (
      <div className="mission-result fail">
        <h1>❌ Attempt Failed</h1>
        <p>Score: {score} / {mission.questions?.length || 1}</p>

        {attempts < (mission.maxRetries || 1) ? (
          <button onClick={() => setResult("idle")}>
            Retry ({mission.maxRetries! - attempts} left)
          </button>
        ) : (
          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        )}
      </div>
    );
  }

const handleSelect = (qIndex: number, option: string) => {
  setAnswers((prev) => ({
    ...prev,
    [qIndex]: option,
  }));
};

  return (
    <div className="mission-page">

      <h1>{mission.title}</h1>

      {mission.type === "content" && <p>{mission.content}</p>}

      {mission.type === "video" && <p>🎥 Video coming soon</p>}

      {mission.type === "pdf" && <p>📄 PDF coming soon</p>}

      {mission.type === "artefact" && (
        <>
          <ul>
            {mission.instructions?.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>

          <textarea
            className="mission-textarea"
            placeholder="Write your response..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={locked}
          />
        </>
      )}

      {mission.type === "quiz" &&
        mission.questions?.map((q, index) => (
          <div key={index} className="question-card">
            <p>{q.question}</p>

            {q.options.map((opt, i) => (
              <label key={i} className="option">
                <input
                  type="radio"
                  name={`q-${index}`}
                  checked={answers[index] === opt}
                  disabled={locked}
                  onChange={() => handleSelect(index, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

      {!locked && (
        <button onClick={handleSubmit} className="mission-btn">
          Submit
        </button>
      )}
    </div>
  );
}