import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./markdownComponents";

interface StreamingMessageProps {
  content: string;
  agentColor?: "blue" | "purple";
}

export function StreamingMessage({
  content,
  agentColor = "blue",
}: StreamingMessageProps) {
  const bgColor = agentColor === "purple" ? "bg-purple-600" : "bg-[#1e1e1e]";
  const borderColor = agentColor === "purple" ? "" : "border border-gray-800";

  return (
    <div className="flex gap-4 flex-row">
      <div
        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md ${
          agentColor === "purple"
            ? "bg-purple-600"
            : "bg-[#1e1e1e] border border-gray-700"
        }`}>
        <Bot size={16} className="text-white" />
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-6 py-4 ${bgColor} ${borderColor}`}>
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        <span className="animate-pulse ml-1 text-blue-400 font-bold">▋</span>
      </div>
    </div>
  );
}
