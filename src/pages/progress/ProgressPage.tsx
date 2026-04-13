import OverallProgressCard from "../../components/progress/OverallProgressCard";
import ProgressTimeline from "../../components/progress/ProgressTimeline";
import AssessorFeedbackCard from "../../components/progress/AssessorFeedbackCard";
import SkillDevelopmentPanel from "../../components/progress/SkillDevelopmentPanel";

export default function ProgressPage() {
  return (
    <div className="progress-page">

      <div className="progress-container">
        <div className="progress-grid">

          {/* LEFT */}
          <div className="progress-left">

            <div className="progress-header">
              <h1>Learning Progress</h1>
              <p>
                Track your progress and view feedback on your learning journey
              </p>
            </div>

            <OverallProgressCard />
            <ProgressTimeline />
            <AssessorFeedbackCard />

          </div>

          {/* RIGHT */}
          <div className="progress-right">
            <SkillDevelopmentPanel />
          </div>

        </div>
      </div>

    </div>
  );
}