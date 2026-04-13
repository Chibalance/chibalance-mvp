import CompletionCard from "../../components/evidence/CompletionCard";
import AchievementSummaryPanel from "../../components/evidence/AchievementSummaryPanel";

export default function EvidencePackPage() {
  return (
    <div className="evidence-page">

      <div className="evidence-container">
        <div className="evidence-grid">

          {/* LEFT */}
          <div className="evidence-left">
            <CompletionCard />
          </div>

          {/* RIGHT */}
          <div className="evidence-right">
            <AchievementSummaryPanel />
          </div>

        </div>
      </div>

    </div>
  );
}