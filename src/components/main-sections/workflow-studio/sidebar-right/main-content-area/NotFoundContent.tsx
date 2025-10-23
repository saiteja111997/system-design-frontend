import React from "react";

interface NotFoundContentProps {
  selectedTab: string | null;
}

const NotFoundContent: React.FC<NotFoundContentProps> = ({ selectedTab }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Tab Not Found
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        The selected tab &quot;{selectedTab}&quot; doesn&apos;t have any content
        configured.
      </p>
    </div>
  );
};

export default NotFoundContent;
