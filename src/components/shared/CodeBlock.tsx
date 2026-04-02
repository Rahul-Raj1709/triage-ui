import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { COPY_FEEDBACK_TIMEOUT } from "@/constants/config";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-700 bg-[#141414] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 lowercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm text-blue-300 font-mono whitespace-pre text-left">
        {code}
      </div>
    </div>
  );
}
