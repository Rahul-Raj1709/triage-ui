import React, { useState } from "react";
import { Copy, Check, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface UiDeveloperDashboardProps {
  problemDescription: string;
  setProblemDescription: Dispatch<SetStateAction<string>>;
  codeOutput: string;
  setCodeOutput: Dispatch<SetStateAction<string>>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  copied: boolean;
  setCopied: Dispatch<SetStateAction<boolean>>;
  history: Array<{ id: string; title: string }>;
  setHistory: Dispatch<SetStateAction<Array<{ id: string; title: string }>>>;
}

export default function UiDeveloperDashboard({
  problemDescription,
  setProblemDescription,
  codeOutput,
  setCodeOutput,
  isGenerating,
  setIsGenerating,
  copied,
  setCopied,
  history,
  setHistory,
}: UiDeveloperDashboardProps) {
  const [workspacePath, setWorkspacePath] = useState("");
  const [targetFileToRead, setTargetFileToRead] = useState("");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setCodeOutput(""); // Clear previous output
    setIsGenerating(true);

    try {
      const response = await fetch(
        "https://localhost:7290/api/ui-agent/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            problemDescription,
            workspacePath,
            targetFileToRead,
          }),
        },
      );

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();

            if (dataStr === "[DONE]") {
              setIsGenerating(false);

              // Add to history
              if (problemDescription.trim()) {
                setHistory([
                  {
                    id: Date.now().toString(),
                    title: problemDescription.substring(0, 50) + "...",
                  },
                  ...history,
                ]);
              }
              return;
            }

            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                setCodeOutput((prev) => prev + parsed.text);
              } catch (err) {
                console.warn("Skipped partial chunk", dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to stream UI code:", error);
      setCodeOutput(
        (prev) => prev + "\n\n**Error:** Connection lost or timeout exceeded.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-[#131313] text-gray-900 dark:text-gray-100 scrollbar-hide">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0a0a] flex flex-col scrollbar-hide">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm font-semibold">
            <Plus size={18} />
            New Generation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-500 p-4">
                No history yet
              </p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm truncate">
                  {item.title}
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start scrollbar-hide">
          <div className="w-full max-w-2xl">
            {codeOutput ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Generated Component
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Problem: {problemDescription.substring(0, 50)}
                      {problemDescription.length > 50 ? "..." : ""}
                    </p>
                  </div>
                  {codeOutput && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors whitespace-nowrap">
                      {copied ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy code
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg p-6 whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto scrollbar-hide font-mono">
                  {codeOutput}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                  UI Developer Agent
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Describe a component and let the expert agent build it for you
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#131313] p-8">
          <form onSubmit={handleGenerateCode} className="max-w-2xl mx-auto">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={workspacePath}
                  onChange={(e) => setWorkspacePath(e.target.value)}
                  placeholder="Workspace path (Optional)..."
                  className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-600 scrollbar-hide"
                  disabled={isGenerating}
                />
                <input
                  type="text"
                  value={targetFileToRead}
                  onChange={(e) => setTargetFileToRead(e.target.value)}
                  placeholder="Target file to read (Optional)..."
                  className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-600 scrollbar-hide"
                  disabled={isGenerating}
                />
              </div>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe your component..."
                className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-600 resize-none scrollbar-hide w-full"
                rows={2}
                disabled={isGenerating}
                required
              />
              <button
                type="submit"
                disabled={isGenerating || !problemDescription.trim()}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white dark:text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                {isGenerating ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  "Generate Code"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
