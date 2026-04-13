import { useNavigate } from "react-router-dom";

export default function MissionCard({ mission }: any) {
  const navigate = useNavigate();

  const getStatusClass = () => {
    if (mission.status === "completed") return "in-progress";
    if (mission.status === "failed") return "assessment-required";
    return "pending-review";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{mission.title}</h3>
        <span className={`badge ${getStatusClass()}`}>
          {mission.status}
        </span>
      </div>

      <p className="card-desc">
        {mission.type === "quiz"
          ? "Complete the assessment"
          : "Submit your artefact"}
      </p>

      <button
        className="btn"
        onClick={() => navigate(`/mission/${mission.id}`)}
      >
        Start Mission
      </button>
    </div>
  );
}