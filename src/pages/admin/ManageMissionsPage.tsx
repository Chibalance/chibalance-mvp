import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
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
  type: string;
  sprintId: string;
  sprintTitle?: string;
  questions?: Question[];
  passRule?: string;
  maxRetries?: number;
  content?: string;
};

/* ================= COMPONENT ================= */

export default function ManageMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);

  /* CREATE STATE */
  const [title, setTitle] = useState("");
  const [type, setType] = useState("quiz");
  const [sprintId, setSprintId] = useState("");
  const [content, setContent] = useState("");
  const [passRule, setPassRule] = useState("1/1");
  const [maxRetries, setMaxRetries] = useState(2);
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);

  /* EDIT STATE */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMission, setEditMission] = useState<any>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= FETCH ================= */

  const fetchAll = async () => {
    const missionSnap = await getDocs(collection(db, "missions"));
    const sprintSnap = await getDocs(collection(db, "sprints"));

    const sprintMap: any = {};
    sprintSnap.docs.forEach((doc) => {
      sprintMap[doc.id] = doc.data().title;
    });

    const missionsData: Mission[] = missionSnap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        sprintTitle: sprintMap[data.sprintId] || "Unknown Sprint",
        content: data.content || data.instructions?.[0] || "",
      };
    });

    setMissions(missionsData);
    setSprints(sprintSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    if (!sprintSnap.empty) setSprintId(sprintSnap.docs[0].id);
  };

  /* ================= CREATE ================= */

  const handleAdd = async () => {
    const newMission: any = { title, type, sprintId };

    if (type === "content") newMission.content = content;
    if (type === "artefact") newMission.instructions = [content];

    if (type === "quiz") {
      newMission.questions = questions;
      newMission.passRule = passRule;
      newMission.maxRetries = maxRetries;
    }

    await addDoc(collection(db, "missions"), newMission);

    setTitle("");
    setContent("");
    setPassRule("1/1");
    setMaxRetries(2);
    setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);

    fetchAll();
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "missions", id));
    fetchAll();
  };

  /* ================= EDIT ================= */

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setEditMission({
      ...m,
      questions: m.questions || [],
    });
  };

  const handleUpdate = async () => {
    const ref = doc(db, "missions", editMission.id);

    const updated: any = {
      title: editMission.title,
      type: editMission.type,
      sprintId: editMission.sprintId,
    };

    if (editMission.type === "quiz") {
      updated.questions = editMission.questions;
      updated.passRule = editMission.passRule;
      updated.maxRetries = editMission.maxRetries;
    }

    if (editMission.type === "content") updated.content = editMission.content;
    if (editMission.type === "artefact")
      updated.instructions = [editMission.content];

    await updateDoc(ref, updated);

    setEditingId(null);
    fetchAll();
  };

  /* ================= EDIT HELPERS ================= */

  const updateEditQuestion = (i: number, field: string, value: any) => {
    const updated = [...editMission.questions];
    (updated[i] as any)[field] = value;
    setEditMission({ ...editMission, questions: updated });
  };

  const updateEditOption = (qi: number, oi: number, value: string) => {
    const updated = [...editMission.questions];
    updated[qi].options[oi] = value;
    setEditMission({ ...editMission, questions: updated });
  };

  const addEditQuestion = () => {
    setEditMission({
      ...editMission,
      questions: [
        ...editMission.questions,
        { question: "", options: ["", "", "", ""], answer: "" },
      ],
    });
  };

  const removeEditQuestion = (i: number) => {
    setEditMission({
      ...editMission,
      questions: editMission.questions.filter((_: any, idx: number) => idx !== i),
    });
  };

  /* ================= CREATE HELPERS ================= */

  const updateQuestion = (i: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[i] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  const removeQuestion = (i: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ================= UI ================= */

  return (
    <div className="admin-page">
      <h1>Manage Missions</h1>

      {/* ================= CREATE FORM (UNCHANGED PREMIUM UI) ================= */}
      {/* ===== FORM ===== */}
      <div className="admin-form-card">

        {/* HEADER */}
        <div className="form-header">
          <h3>Create Mission</h3>
          <p>Design a new mission with structured content or quiz</p>
        </div>

        {/* BASIC INFO */}
        <div className="form-grid">

          <div className="form-group">
            <label>Mission Title</label>
            <input
              placeholder="e.g. Communication Skills Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mission Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="quiz">Quiz</option>
              <option value="artefact">Artefact</option>
              <option value="content">Content</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Sprint</label>
            <select value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* CONTENT / ARTEFACT */}
        {(type === "content" || type === "artefact") && (
          <div className="form-section">
            <label>Instructions / Content</label>
            <textarea
              className="premium-textarea"
              placeholder="Write detailed instructions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        {/* QUIZ BUILDER */}
        {type === "quiz" && (
          <div className="form-section">

            <div className="section-header">
              <h4>Quiz Builder</h4>
              <button className="admin-btn secondary" onClick={addQuestion}>
                Add Question
              </button>
            </div>

            {/* QUIZ SETTINGS */}
            <div className="form-grid">

              <div className="form-group">
                <label>Pass Rule</label>
                <input
                  placeholder="e.g. 2/3"
                  value={passRule}
                  onChange={(e) => setPassRule(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Max Retries</label>
                <input
                  type="number"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                />
              </div>

            </div>

            {/* QUESTIONS */}
            {questions.map((q, i) => (
              <div key={i} className="question-card">

                <div className="question-top">
                  <strong>Question {i + 1}</strong>
                  <button
                    className="admin-btn danger small"
                    onClick={() => removeQuestion(i)}
                  >
                    Remove
                  </button>
                </div>

                {/* QUESTION */}
                <div className="form-group">
                  <label>Question</label>
                  <input
                    placeholder="Enter question..."
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(i, "question", e.target.value)
                    }
                  />
                </div>

                {/* OPTIONS */}
                <div className="options-grid">
                  {q.options.map((opt, j) => (
                    <div key={j} className="form-group">
                      <label>Option {j + 1}</label>
                      <input
                        placeholder={`Enter option ${j + 1}`}
                        value={opt}
                        onChange={(e) =>
                          updateOption(i, j, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* CORRECT ANSWER */}
                <div className="form-group">
                  <label>Correct Answer</label>
                  <input
                    className="correct-answer"
                    placeholder="Must match one of the options"
                    value={q.answer}
                    onChange={(e) =>
                      updateQuestion(i, "answer", e.target.value)
                    }
                  />
                </div>

              </div>
            ))}

          </div>
        )}

        {/* ACTIONS */}
        <div className="form-actions">
          <button className="admin-btn secondary">Cancel</button>
          <button onClick={handleAdd} className="admin-btn primary">
            Create Mission
          </button>
        </div>

      </div>
      {/* ================= LIST ================= */}
      <div className="admin-list">
        {missions.map((m) => (
          <div key={m.id} className="admin-card">

            {editingId === m.id ? (
              <div className="form-section">

                {/* BASIC */}
                <div className="form-group">
                  <label>Title</label>
                  <input
                    value={editMission.title}
                    onChange={(e) =>
                      setEditMission({ ...editMission, title: e.target.value })
                    }
                  />
                </div>

                {/* QUIZ FULL EDIT */}
                {editMission.type === "quiz" && (
                  <>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Pass Rule</label>
                        <input
                          value={editMission.passRule}
                          onChange={(e) =>
                            setEditMission({
                              ...editMission,
                              passRule: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Max Retries</label>
                        <input
                          type="number"
                          value={editMission.maxRetries}
                          onChange={(e) =>
                            setEditMission({
                              ...editMission,
                              maxRetries: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <button className="admin-btn secondary" onClick={addEditQuestion}>
                      Add Question
                    </button>

                    {editMission.questions.map((q: any, i: number) => (
                      <div key={i} className="question-card">

                        {/* HEADER */}
                        <div className="question-top">
                          <strong>Question {i + 1}</strong>
                          <button
                            className="admin-btn danger small"
                            onClick={() => removeEditQuestion(i)}
                          >
                            Remove
                          </button>
                        </div>

                        {/* QUESTION */}
                        <div className="form-group">
                          <label>Question</label>
                          <input
                            value={q.question}
                            onChange={(e) =>
                              updateEditQuestion(i, "question", e.target.value)
                            }
                          />
                        </div>

                        {/* OPTIONS */}
                        <div className="options-grid">
                          {q.options.map((opt: any, j: number) => (
                            <div key={j} className="form-group">
                              <label>Option {j + 1}</label>
                              <input
                                value={opt}
                                onChange={(e) =>
                                  updateEditOption(i, j, e.target.value)
                                }
                              />
                            </div>
                          ))}
                        </div>

                        {/* CORRECT ANSWER */}
                        <div className="form-group">
                          <label>Correct Answer</label>
                          <input
                            className="correct-answer"
                            placeholder="Must match one of the options"
                            value={q.answer}
                            onChange={(e) =>
                              updateEditQuestion(i, "answer", e.target.value)
                            }
                          />
                        </div>

                      </div>
                    ))}
                  </>
                )}
                {/* CONTENT / ARTEFACT EDIT */}
                {(editMission.type === "content" || editMission.type === "artefact") && (
                  <div className="form-section">
                    <div className="form-group">
                      <label>Instructions / Content</label>
                      <textarea
                        className="premium-textarea"
                        placeholder="Edit instructions..."
                        value={editMission.content || ""}
                        onChange={(e) =>
                          setEditMission({
                            ...editMission,
                            content: e.target.value,
                          })
                        }
                      />
                    </div>

                  </div>
                )}

                <div className="form-actions">
                  <button
                    className="admin-btn secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>

                  <button className="admin-btn primary" onClick={handleUpdate}>
                    Save
                  </button>
                </div>

              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h3>{m.title}</h3>
                  <p>Type: {m.type} • {m.sprintTitle}</p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="admin-btn secondary" onClick={() => handleEdit(m)}>
                    Edit
                  </button>
                  <button className="admin-btn danger" onClick={() => handleDelete(m.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}