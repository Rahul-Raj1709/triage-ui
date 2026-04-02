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
    <div className="lg:col-span-3 flex flex-col bg-[#141414] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-0 relative">
      {/* Top Bar */}
      <div className="flex items-center px-6 py-4 border-b border-gray-800 bg-[#1a1a1a] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">
              System Triage Squad
            </h3>
            <p className="text-xs text-gray-500">SRE & Developer Agents</p>
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
        <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-[#141414]">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
              <AlertTriangle size={56} className="opacity-20" />
              <p className="text-sm">
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
            <StreamingMessage content={currentStream} agentColor="purple" />
          )}
          <div ref={endOfLogRef} />
        </div>
      )}
    </div>
  );
}
