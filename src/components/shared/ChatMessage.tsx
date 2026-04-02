import { useState } from "react";
import { User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types/chat";
import { markdownComponents } from "./markdownComponents";
import { COPY_FEEDBACK_TIMEOUT } from "@/constants/config";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT);
  };

  return (
    <div className="flex gap-4 flex-col w-full">
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
          className={`max-w-[85%] rounded px-4 py-3 relative ${
            message.role === "user"
              ? "bg-black text-white"
              : "bg-gray-100 border border-gray-300 text-black"
          }`}>
          {message.role === "user" ? (
            <p className="whitespace-pre-wrap text-sm pr-8">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          )}
          <button
            onClick={handleCopy}
            className={`absolute bottom-2 right-2 p-1.5 rounded transition-colors ${
              message.role === "user"
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-black hover:bg-gray-200"
            }`}
            title="Copy message">
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
