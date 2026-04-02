import { useState } from "react";
import { Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./markdownComponents";
import { COPY_FEEDBACK_TIMEOUT } from "@/constants/config";

interface StreamingMessageProps {
  content: string;
  agentColor?: "blue" | "purple" | "black";
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT);
  };

  return (
    <div className="flex gap-4 flex-col w-full">
      <div className="flex gap-4 flex-row">
        <div className="w-8 h-8 flex-shrink-0 rounded flex items-center justify-center mt-1 bg-white border border-gray-300">
          <Bot size={16} className="text-black" />
        </div>
        <div className="max-w-[85%] rounded px-4 py-3 bg-gray-100 border border-gray-300 text-black">
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
          <span className="animate-pulse ml-1 text-black font-bold">▋</span>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="w-8 flex-shrink-0" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-black hover:bg-gray-200 transition-colors px-3 py-1.5 rounded ml-2 bg-gray-50 border border-gray-300">
          {copied ? (
            <Check className="w-4 h-4 text-green-700" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
