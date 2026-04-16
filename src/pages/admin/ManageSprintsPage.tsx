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

export default function ManageSprintsPage() {
  const [sprints, setSprints] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    const snap = await getDocs(collection(db, "sprints"));
    setSprints(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAdd = async () => {
    await addDoc(collection(db, "sprints"), { title, description });
    setTitle("");
    setDescription("");
    fetchSprints();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "sprints", id));
    fetchSprints();
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditDescription(s.description);
  };

  const handleUpdate = async (id: string) => {
    await updateDoc(doc(db, "sprints", id), {
      title: editTitle,
      description: editDescription,
    });

    setEditingId(null);
    fetchSprints();
  };

  return (
    <div className="admin-page">
      <h1>Manage Sprints</h1>

      {/* ADD FORM */}
      <div className="admin-form-card">

        <div className="form-header">
          <h3>Create New Sprint</h3>
          <p>Add a new learning sprint to the system</p>
        </div>

        <div className="form-grid">

          <div className="form-group">
            <label>Sprint Title</label>
            <input
              placeholder="e.g. Leadership Communication"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              placeholder="Short description of the sprint"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

        </div>

        <div className="form-actions">
          <button className="admin-btn secondary">Cancel</button>

          <button onClick={handleAdd} className="admin-btn primary">
            Add Sprint
          </button>
        </div>

      </div>
      <div className="admin-list">
        {sprints.map((s) => (
          <div key={s.id} className="admin-card">

            {editingId === s.id ? (
              <div className="form-section">

                <div className="form-group">
                  <label>Title</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </div>

                <div className="form-actions">
                  <button className="admin-btn secondary" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>

                  <button className="admin-btn primary" onClick={() => handleUpdate(s.id)}>
                    Save
                  </button>
                </div>

              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h3>{s.title}</h3>
                  <p style={{ color: "#6b7280" }}>{s.description}</p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="admin-btn secondary" onClick={() => handleEdit(s)}>
                    Edit
                  </button>

                  <button className="admin-btn danger" onClick={() => handleDelete(s.id)}>
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