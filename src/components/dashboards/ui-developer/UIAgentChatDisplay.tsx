import { Bot, ArrowDown } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import type { RefObject } from "react";
import { useState, useRef, useEffect } from "react";
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
  const [showGoToBottom, setShowGoToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && followUpMessage.trim() && !isGenerating) {
      onFollowUpSubmit();
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowGoToBottom(!isNearBottom);
    }
  };

  const scrollToBottom = () => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowGoToBottom(false);
  };

  useEffect(() => {
    handleScroll();
  }, [messages, currentStream]);

  return (
    <div className="lg:col-span-3 flex flex-col bg-white rounded border border-gray-300 overflow-hidden h-full relative">
      {/* Top Bar */}
      <div className="flex items-center px-6 py-4 border-b border-gray-300 bg-gray-50 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-black">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-black">UiAgent</h3>
            <p className="text-xs text-gray-600">React & Tailwind Expert</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 p-6 overflow-y-auto space-y-8 bg-white scrollbar-hide"
        ref={scrollContainerRef}
        onScroll={handleScroll}>
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <Bot size={56} className="opacity-30" />
            <p className="text-sm text-gray-600">
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
          <StreamingMessage content={currentStream} agentColor="black" />
        )}
        <div ref={endOfLogRef} />
      </div>

      {/* Go to Bottom Button */}
      {showGoToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors shadow-lg z-20 flex items-center justify-center">
          <ArrowDown size={20} />
        </button>
      )}

      {/* Follow-up Chat Input */}
      {hasConversation && (
        <div className="p-4 bg-gray-50 border-t border-gray-300 shrink-0">
          <div className="flex gap-3 relative">
            <input
              type="text"
              value={followUpMessage}
              onChange={(e) => onFollowUpChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question or request changes..."
              disabled={isGenerating || !hasConversation}
              className="flex-grow p-4 rounded bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-500 disabled:opacity-50 text-sm transition-colors"
            />
            <button
              onClick={onFollowUpSubmit}
              disabled={
                isGenerating || !hasConversation || !followUpMessage.trim()
              }
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded font-semibold transition-colors disabled:bg-gray-300 disabled:text-gray-500 text-sm flex items-center gap-2 shrink-0">
              {isGenerating ? "Working..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
