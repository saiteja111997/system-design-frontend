import React from "react";

const AnalyticsContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Analytics
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        View system performance metrics, load balancing data, and throughput
        statistics.
      </p>
      {/* Analytics content will be implemented here */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Analytics dashboard coming soon...
        </p>
      </div>
    </div>
  );
};

export default AnalyticsContent;
