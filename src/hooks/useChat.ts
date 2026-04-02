import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";

export interface UseChatState {
  conversationId: string | null;
  messages: ChatMessage[];
  currentStream: string;
  isLoading: boolean;
  followUpMessage: string;
}

export interface UseChatActions {
  setConversationId: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setCurrentStream: (stream: string) => void;
  setIsLoading: (loading: boolean) => void;
  setFollowUpMessage: (message: string) => void;
  reset: () => void;
}

export function useChat(): UseChatState & UseChatActions {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStream, setCurrentStream] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const reset = () => {
    setConversationId(null);
    setMessages([]);
    setCurrentStream("");
    setFollowUpMessage("");
  };

  return {
    conversationId,
    messages,
    currentStream,
    isLoading,
    followUpMessage,
    setConversationId,
    setMessages,
    addMessage,
    setCurrentStream,
    setIsLoading,
    setFollowUpMessage,
    reset,
  };
}

export function useAutoScroll(
  dependencies: Array<string | ChatMessage[]>,
): React.RefObject<HTMLDivElement | null> {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, dependencies);

  return endOfLogRef;
}
