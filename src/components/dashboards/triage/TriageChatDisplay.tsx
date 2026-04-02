import { AlertTriangle } from "lucide-react";
import type { ChatMessage, TriageResult } from "@/types/chat";
import type { RefObject } from "react";
import { ChatMessageComponent } from "@/components/shared/ChatMessage";
import { StreamingMessage } from "@/components/shared/StreamingMessage";

interface TriageChatDisplayProps {
  mode: "json" | "stream";
  messages: ChatMessage[];
  currentStream: string;
  isLoading: boolean;
  jsonResult: TriageResult | null;
  endOfLogRef: RefObject<HTMLDivElement | null>;
  TriageResultDisplay: React.ComponentType<TriageResult>;
}

export function TriageChatDisplay({
  mode,
  messages,
  currentStream,
  isLoading,
  jsonResult,
  endOfLogRef,
  TriageResultDisplay,
}: TriageChatDisplayProps) {
  return (
    <div className="lg:col-span-3 flex flex-col bg-white rounded border border-gray-300 overflow-hidden min-h-0 relative">
      {/* Top Bar */}
      <div className="flex items-center px-6 py-4 border-b border-gray-300 bg-gray-50 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-black">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-black">
              System Triage Squad
            </h3>
            <p className="text-xs text-gray-600">SRE & Developer Agents</p>
          </div>
        </div>
      </div>

      {/* JSON Mode Display */}
      {mode === "json" && jsonResult && (
        <div className="flex-1 p-8 overflow-y-auto">
          <TriageResultDisplay {...jsonResult} />
        </div>
      )}

      {/* Stream Mode Display */}
      {mode === "stream" && (
        <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-white">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <AlertTriangle size={56} className="opacity-30" />
              <p className="text-sm text-gray-600">
                Awaiting alert... Click 'Start Triage' to begin analysis.
              </p>
            </div>
          )}

          {/* Render Permanent Messages */}
          {messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))}

          {/* Render Live Streaming Message */}
          {isLoading && currentStream && (
            <StreamingMessage content={currentStream} agentColor="black" />
          )}
          <div ref={endOfLogRef} />
        </div>
      )}
    </div>
  );
}
