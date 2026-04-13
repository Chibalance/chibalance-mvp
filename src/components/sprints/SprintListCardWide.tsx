import { useNavigate } from "react-router-dom";

type Sprint = {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "in-progress" | "completed";
};

export default function SprintListCardWide({ sprint }: { sprint: Sprint }) {
  const navigate = useNavigate();

  return (
    <div className="sprintwide-card">

      {/* LEFT */}
      <div className="sprintwide-left">
        <h3>{sprint.title}</h3>
        <p>{sprint.description}</p>

        <div className="sprintwide-progress">
          <div
            className="sprintwide-progress-fill"
            style={{ width: `${sprint.progress}%` }}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="sprintwide-right">

        <span className={`status ${sprint.status}`}>
          {sprint.status === "completed" ? "Completed" : "In Progress"}
        </span>

        <span className="percent">{sprint.progress}%</span>

        <button onClick={() => navigate(`/sprint/${sprint.id}`)}>
          Continue
        </button>

      </div>
    </div>
  );
}