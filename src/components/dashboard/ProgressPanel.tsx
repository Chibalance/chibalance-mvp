export default function ProgressPanel({ sprints }: any) {

  const total = sprints.length;
  const completed = sprints.filter((s: any) => s.progress === 100).length;

  const progressPercent = total
    ? Math.round((completed / total) * 100)
    : 0;

  return (
    <div className="panel-container">

      <div className="panel">
        <h3>Progress Summary</h3>

        <div>
          <div className="progress-top">
            <span>Completed Sprints</span>
            <span>{completed}/{total}</span>
          </div>

          <div className="progress-bar">
            <div style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <p>{total} Active Sprints</p>
      </div>

      <div className="panel">
        <h3>Activity Status</h3>
        <p>Track your mission submissions and assessments.</p>
      </div>

      <div className="panel tip">
        💡 Complete missions daily to maintain streak!
      </div>
    </div>
  );
}