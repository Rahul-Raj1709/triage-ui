import { RotateCcw } from "lucide-react";

interface UIAgentInputFormProps {
  problemDescription: string;
  workspacePath: string;
  targetFileToRead: string;
  isGenerating: boolean;
  hasConversation: boolean;
  onProblemDescriptionChange: (value: string) => void;
  onWorkspacePathChange: (value: string) => void;
  onTargetFileChange: (value: string) => void;
  onStartSession: () => void;
  onResetContext: () => void;
}

export function UIAgentInputForm({
  problemDescription,
  workspacePath,
  targetFileToRead,
  isGenerating,
  hasConversation,
  onProblemDescriptionChange,
  onWorkspacePathChange,
  onTargetFileChange,
  onStartSession,
  onResetContext,
}: UIAgentInputFormProps) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-5 bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm h-fit">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">
          1. Initial Requirement
        </label>
        <textarea
          value={problemDescription}
          onChange={(e) => onProblemDescriptionChange(e.target.value)}
          placeholder="Create a pricing card component using Tailwind..."
          className="w-full px-4 py-3 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm min-h-[140px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
          disabled={isGenerating || hasConversation}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">
          2. Workspace Path
        </label>
        <input
          type="text"
          value={workspacePath}
          onChange={(e) => onWorkspacePathChange(e.target.value)}
          placeholder="C:\Code\MyReactApp"
          className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          disabled={isGenerating || hasConversation}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">
          3. Target File
        </label>
        <input
          type="text"
          value={targetFileToRead}
          onChange={(e) => onTargetFileChange(e.target.value)}
          placeholder="src/App.tsx"
          className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          disabled={isGenerating || hasConversation}
        />
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button
          type="button"
          onClick={onStartSession}
          disabled={
            isGenerating || !problemDescription.trim() || hasConversation
          }
          className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
          {isGenerating && !hasConversation ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{" "}
              Initializing...
            </>
          ) : (
            "Start Session"
          )}
        </button>
        {hasConversation && (
          <button
            type="button"
            onClick={onResetContext}
            disabled={isGenerating}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-gray-700">
            <RotateCcw size={16} /> Reset Context
          </button>
        )}
      </div>
    </div>
  );
}
