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
    <div className="my-4 rounded overflow-hidden border border-gray-300 bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
        <span className="text-xs font-semibold text-gray-600 lowercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-black transition-colors">
          {copied ? (
            <Check className="w-4 h-4 text-green-700" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm text-gray-900 font-mono whitespace-pre text-left">
        {code}
      </div>
    </div>
  );
}
