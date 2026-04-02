import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types/chat";
import { markdownComponents } from "./markdownComponents";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  return (
    <div
      className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-8 h-8 flex-shrink-0 rounded flex items-center justify-center mt-1 ${
          message.role === "user"
            ? "bg-black"
            : "bg-white border border-gray-300"
        }`}>
        {message.role === "user" ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-black" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded px-4 py-3 ${
          message.role === "user"
            ? "bg-black text-white"
            : "bg-gray-100 border border-gray-300 text-black"
        }`}>
        {message.role === "user" ? (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        ) : (
          <ReactMarkdown components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
