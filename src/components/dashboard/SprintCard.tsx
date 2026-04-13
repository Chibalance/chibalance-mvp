import { useNavigate } from "react-router-dom";

export default function SprintCard({
  id,
  title,
  description,
  progress,
  status,
}: any) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div>
        <div className="card-header">
          <h3>{title}</h3>
          <span className={`badge ${status}`}>
            {status.replace("-", " ")}
          </span>
        </div>

        <p className="card-desc">{description}</p>
      </div>

      <div>
        <div className="progress-top">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      <button
        className="btn"
        onClick={() => navigate(`/sprint/${id}`)}
      >
        Continue Sprint
      </button>
    </div>
  );
}