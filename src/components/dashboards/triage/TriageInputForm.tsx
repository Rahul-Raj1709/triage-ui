import { RotateCcw } from "lucide-react";

interface TriageInputFormProps {
  serviceName: string;
  alertMessage: string;
  mode: "json" | "stream";
  isLoading: boolean;
  hasConversation: boolean;
  onServiceNameChange: (value: string) => void;
  onAlertMessageChange: (value: string) => void;
  onModeChange: (value: "json" | "stream") => void;
  onStartTriage: () => void;
  onReset: () => void;
}

export function TriageInputForm({
  serviceName,
  alertMessage,
  mode,
  isLoading,
  hasConversation,
  onServiceNameChange,
  onAlertMessageChange,
  onModeChange,
  onStartTriage,
  onReset,
}: TriageInputFormProps) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-5 bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm h-fit">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">
          Target Service
        </label>
        <input
          value={serviceName}
          onChange={(e) => onServiceNameChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">
          Alert Message
        </label>
        <textarea
          value={alertMessage}
          onChange={(e) => onAlertMessageChange(e.target.value)}
          className="w-full px-4 py-3 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm min-h-[100px] resize-y focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">
          Execution Mode
        </label>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as "json" | "stream")}
          className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
          disabled={isLoading || hasConversation}>
          <option value="stream">Live Multi-Agent Stream</option>
          <option value="json">Fast Structured JSON</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={onStartTriage}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
          {isLoading && !hasConversation ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{" "}
              Starting...
            </>
          ) : (
            "Start Triage"
          )}
        </button>
        {hasConversation && (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-gray-700">
            <RotateCcw size={16} /> Reset Session
          </button>
        )}
      </div>
    </div>
  );
}
