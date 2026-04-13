import { useNavigate } from "react-router-dom";

export default function SprintListCard({
  id,
  title,
  description,
  progress,
  status,
}: any) {
  const navigate = useNavigate();

  const statusLabel =
    status === "completed"
      ? "Completed"
      : status === "in-progress"
      ? "In Progress"
      : "Pending";

  return (
    <div className="list-card">
      <div className="list-left">
        <div className="list-header">
          <h3>{title}</h3>
          <span className={`badge ${status}`}>{statusLabel}</span>
        </div>

        <p className="list-desc">{description}</p>

        <div className="progress-top">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="list-right">
        <button onClick={() => navigate(`/sprint/${id}`)}>
          Continue
        </button>
      </div>
    </div>
  );
}