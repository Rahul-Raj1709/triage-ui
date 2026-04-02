interface TriageResultDisplayProps {
  severity: "Critical" | "High" | "Warning" | "Low";
  rootCause: string;
  recommendedAction: string;
  requiresCodeChange: boolean;
}

export function TriageResultDisplay({
  severity,
  rootCause,
  recommendedAction,
  requiresCodeChange,
}: TriageResultDisplayProps) {
  const severityStyles = {
    Critical: "bg-gray-950 text-black border border-black",
    High: "bg-gray-900 text-gray-900 border border-gray-700",
    Warning: "bg-gray-700 text-gray-700 border border-gray-600",
    Low: "bg-gray-600 text-gray-600 border border-gray-500",
  };

  return (
    <div className="bg-white border border-gray-300 rounded p-6 space-y-6">
      <div className="flex items-center justify-between">
        <span
          className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${severityStyles[severity]}`}>
          {severity} SEVERITY
        </span>
        {requiresCodeChange && (
          <span className="px-4 py-1.5 rounded text-xs font-bold bg-black text-white border border-gray-400 uppercase tracking-wider">
            CODE CHANGE REQUIRED
          </span>
        )}
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
          Root Cause
        </h3>
        <p className="text-base font-medium text-black leading-relaxed">
          {rootCause}
        </p>
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
          Recommended Action
        </h3>
        <p className="text-base font-medium text-black leading-relaxed">
          {recommendedAction}
        </p>
      </div>
    </div>
  );
}
