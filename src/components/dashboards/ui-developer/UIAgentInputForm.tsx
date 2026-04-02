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
    <div className="lg:col-span-1 flex flex-col gap-5 bg-gray-50 p-6 rounded border border-gray-300 h-fit">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-black">
          1. Initial Requirement
        </label>
        <textarea
          value={problemDescription}
          onChange={(e) => onProblemDescriptionChange(e.target.value)}
          placeholder="Create a pricing card component using Tailwind..."
          className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded text-sm min-h-[140px] resize-y focus:ring-2 focus:ring-black focus:border-transparent outline-none disabled:opacity-50 disabled:bg-gray-100"
          disabled={isGenerating || hasConversation}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-black">
          2. Workspace Path
        </label>
        <input
          type="text"
          value={workspacePath}
          onChange={(e) => onWorkspacePathChange(e.target.value)}
          placeholder="C:\Code\MyReactApp"
          className="w-full px-4 py-2.5 bg-white text-black border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none disabled:opacity-50 disabled:bg-gray-100"
          disabled={isGenerating || hasConversation}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-black">
          3. Target File
        </label>
        <input
          type="text"
          value={targetFileToRead}
          onChange={(e) => onTargetFileChange(e.target.value)}
          placeholder="src/App.tsx"
          className="w-full px-4 py-2.5 bg-white text-black border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none disabled:opacity-50 disabled:bg-gray-100"
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
          className="w-full px-4 py-3 rounded bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
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
            className="w-full px-4 py-3 rounded bg-white text-black font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
            <RotateCcw size={16} /> Reset Context
          </button>
        )}
      </div>
    </div>
  );
}
