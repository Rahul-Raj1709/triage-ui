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
        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md ${
          message.role === "user"
            ? "bg-blue-600"
            : "bg-[#1e1e1e] border border-gray-700"
        }`}>
        {message.role === "user" ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-gray-300" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-6 py-4 ${
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-[#1e1e1e] border border-gray-800"
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
