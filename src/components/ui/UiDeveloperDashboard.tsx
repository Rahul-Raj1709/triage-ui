import { useState, useRef, useEffect } from "react";
import { Copy, Check } from "lucide-react";

// --- NEW: Isolated Code Block Component ---
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#141414] shadow-md">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 lowercase">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-sm text-blue-300 font-mono whitespace-pre text-left">
        {code}
      </div>
    </div>
  );
};

export default function UiDeveloperDashboard() {
  const [problemDescription, setProblemDescription] = useState("");
  const [workspacePath, setWorkspacePath] = useState("");
  const [targetFileToRead, setTargetFileToRead] = useState("");

  const [codeOutput, setCodeOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // State for the global "Copy All" button
  const [copiedAll, setCopiedAll] = useState(false);

  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [codeOutput]);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(codeOutput);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setIsGenerating(true);
    setCodeOutput("");

    try {
      const res = await fetch("http://localhost:5009/api/ui-agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemDescription,
          workspacePath: workspacePath || null,
          targetFileToRead: targetFileToRead || null,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let doneReading = false;

      while (!doneReading) {
        const { value, done } = await reader.read();
        doneReading = done;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              const dataStr = part.replace("data: ", "").trim();

              if (dataStr === "[DONE]") {
                doneReading = true;
                break;
              }

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  setCodeOutput((prev) => prev + parsed.text);
                }
              } catch (err) {
                console.warn("Failed to parse SSE JSON:", dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Agent failed:", error);
      setCodeOutput("Error: Failed to connect to the UI Agent backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- NEW: Custom Markdown Parser ---
  const renderFormattedOutput = (text: string) => {
    if (!text) return null;

    // Split the text using markdown code blocks as the delimiter
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // If the part is a code block
      if (part.startsWith("```") && part.endsWith("```")) {
        // Strip the backticks
        const content = part.slice(3, -3);
        // The first line is usually the language (e.g., "tsx" or "csharp")
        const firstNewline = content.indexOf("\n");

        // If there's no newline, it might be an empty block or inline
        if (firstNewline === -1) return <span key={index}>{part}</span>;

        const language = content.substring(0, firstNewline).trim();
        const code = content.substring(firstNewline + 1).trim();

        return <CodeBlock key={index} code={code} language={language} />;
      }

      // If it's normal text, render it directly
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 pb-24 h-full flex flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">
          UI Developer Agent
        </h1>
        <p className="text-gray-500">
          Autonomous React/TS component generation with Workspace context.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Input Form */}
        <form
          onSubmit={handleGenerateCode}
          className="lg:col-span-1 flex flex-col gap-4 bg-white p-5 rounded-xl border shadow-sm h-fit">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              1. Requirement (Required)
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="e.g., Create a responsive pricing card component using Tailwind..."
              className="w-full px-3 py-2 border rounded-md text-sm min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isGenerating}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              2. Workspace Path (Optional)
            </label>
            <input
              type="text"
              value={workspacePath}
              onChange={(e) => setWorkspacePath(e.target.value)}
              placeholder="C:\Code\MyReactApp\src\components"
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              3. Target File to Read (Optional)
            </label>
            <input
              type="text"
              value={targetFileToRead}
              onChange={(e) => setTargetFileToRead(e.target.value)}
              placeholder="C:\Code\MyReactApp\src\App.tsx"
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isGenerating}
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating || !problemDescription.trim()}
            className="mt-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm">
            {isGenerating ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{" "}
                Thinking...
              </>
            ) : (
              "Generate Code"
            )}
          </button>
        </form>

        {/* Right Column: Code Output */}
        <div className="lg:col-span-2 flex flex-col bg-[#1e1e1e] rounded-xl border shadow-sm overflow-hidden min-h-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#2d2d2d]">
            <span className="text-sm font-medium text-gray-300">
              Agent Output
            </span>
            <button
              onClick={handleCopyAll}
              disabled={!codeOutput}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs bg-gray-800 px-2 py-1 rounded-md border border-gray-600"
              title="Copy Entire Response">
              {copiedAll ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedAll ? "Copied All" : "Copy All"}
            </button>
          </div>

          {/* Output Area */}
          <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-300 font-sans whitespace-pre-wrap leading-relaxed">
            {codeOutput ? (
              <>
                {renderFormattedOutput(codeOutput)}
                {isGenerating && (
                  <span className="animate-pulse ml-1 text-blue-400">▋</span>
                )}
              </>
            ) : (
              <span className="text-gray-500 italic">
                Awaiting instructions... Provide a workspace path to allow the
                agent to analyze your local files.
              </span>
            )}
            <div ref={endOfLogRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
