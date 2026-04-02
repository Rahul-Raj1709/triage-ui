import { Bot } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import type { RefObject } from "react";
import { ChatMessageComponent } from "@/components/shared/ChatMessage";
import { StreamingMessage } from "@/components/shared/StreamingMessage";

interface UIAgentChatDisplayProps {
  messages: ChatMessage[];
  currentStream: string;
  isGenerating: boolean;
  endOfLogRef: RefObject<HTMLDivElement | null>;
  onFollowUpChange: (message: string) => void;
  onFollowUpSubmit: () => void;
  followUpMessage: string;
  hasConversation: boolean;
}

export function UIAgentChatDisplay({
  messages,
  currentStream,
  isGenerating,
  endOfLogRef,
  onFollowUpChange,
  onFollowUpSubmit,
  followUpMessage,
  hasConversation,
}: UIAgentChatDisplayProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && followUpMessage.trim() && !isGenerating) {
      onFollowUpSubmit();
    }
  };

  return (
    <div className="lg:col-span-3 flex flex-col bg-[#141414] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-0 relative">
      {/* Top Bar */}
      <div className="flex items-center px-6 py-4 border-b border-gray-800 bg-[#1a1a1a] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">UiAgent</h3>
            <p className="text-xs text-gray-500">React & Tailwind Expert</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-[#141414]">
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
            <Bot size={56} className="opacity-20" />
            <p className="text-sm">
              Awaiting instructions... Start a session from the left panel.
            </p>
          </div>
        )}

        {/* Render Permanent Messages */}
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}

        {/* Render Live Streaming Message */}
        {isGenerating && currentStream && (
          <StreamingMessage content={currentStream} agentColor="blue" />
        )}
        <div ref={endOfLogRef} />
      </div>

      {/* Follow-up Chat Input */}
      {hasConversation && (
        <div className="p-4 bg-[#1a1a1a] border-t border-gray-800 shrink-0">
          <div className="max-w-4xl mx-auto flex gap-3 relative">
            <input
              type="text"
              value={followUpMessage}
              onChange={(e) => onFollowUpChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question or request changes..."
              disabled={isGenerating || !hasConversation}
              className="flex-grow p-4 rounded-xl bg-[#252526] text-gray-100 border border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-500 disabled:opacity-50 text-sm shadow-inner transition-colors"
            />
            <button
              onClick={onFollowUpSubmit}
              disabled={
                isGenerating || !hasConversation || !followUpMessage.trim()
              }
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm flex items-center gap-2 shadow-lg">
              {isGenerating ? "Working..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
