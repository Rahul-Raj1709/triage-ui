import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./markdownComponents";

interface StreamingMessageProps {
  content: string;
  agentColor?: "blue" | "purple" | "black";
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex gap-4 flex-row">
      <div className="w-8 h-8 flex-shrink-0 rounded flex items-center justify-center mt-1 bg-white border border-gray-300">
        <Bot size={16} className="text-black" />
      </div>
      <div className="max-w-[85%] rounded px-4 py-3 bg-gray-100 border border-gray-300 text-black">
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        <span className="animate-pulse ml-1 text-black font-bold">▋</span>
      </div>
    </div>
  );
}
