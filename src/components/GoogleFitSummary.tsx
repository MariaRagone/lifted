import React from 'react';
import './GoogleFitSummary.css';

interface ActivitySummaryProps {
  steps: number;
  heartPoints: number;
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({ steps, heartPoints }) => {
  return (
    <div className="activity-summary-card">
      <div className="activity-block">
        <span className="label">🚶 Steps</span>
        <span className="value">{steps.toLocaleString()}</span>
      </div>
      <div className="divider" />
      <div className="activity-block">
        <span className="label">❤️ Heart Points</span>
        <span className="value">{heartPoints}</span>
      </div>
    </div>
  );
};

export default ActivitySummary;
