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
    Critical: "bg-red-500/10 text-red-400 border border-red-500/20",
    High: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    Warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    Low: "bg-green-500/10 text-green-400 border border-green-500/20",
  };

  return (
    <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${severityStyles[severity]}`}>
          {severity} SEVERITY
        </span>
        {requiresCodeChange && (
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
            CODE CHANGE REQUIRED
          </span>
        )}
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Root Cause
        </h3>
        <p className="text-base font-medium text-gray-200 leading-relaxed">
          {rootCause}
        </p>
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Recommended Action
        </h3>
        <p className="text-base font-medium text-gray-200 leading-relaxed">
          {recommendedAction}
        </p>
      </div>
    </div>
  );
}
