import React from "react";
import { Copy, Check, Plus } from "lucide-react";

interface UiDeveloperDashboardProps {
  problemDescription: string;
  setProblemDescription: (value: string | ((prev: string) => string)) => void;
  codeOutput: string;
  setCodeOutput: (value: string | ((prev: string) => string)) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  copied: boolean;
  setCopied: (value: boolean) => void;
  history: Array<{ id: string; title: string }>;
  setHistory: (value: Array<{ id: string; title: string }>) => void;
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
  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setCodeOutput("");
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
          body: JSON.stringify({ problemDescription }),
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
                    title:
                      problemDescription.substring(0, 30) +
                      (problemDescription.length > 30 ? "..." : ""),
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
            New Chat
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
                  <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    GeneratedComponent.tsx
                  </h2>
                  {codeOutput && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors">
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
                <pre className="bg-gray-900 dark:bg-[#1e1e1e] text-gray-100 p-6 rounded-lg overflow-x-auto text-xs leading-relaxed border border-gray-700 dark:border-gray-800 scrollbar-hide">
                  <code>{codeOutput}</code>
                </pre>
              </div>
            ) : (
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                  AI UI Generator
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Describe a React component and watch it come to life
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#131313] p-8">
          <form onSubmit={handleGenerateCode} className="max-w-2xl mx-auto">
            <div className="space-y-3">
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe the component you want to build..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 resize-none text-sm placeholder:text-gray-500 dark:placeholder:text-gray-600 scrollbar-hide"
                rows={3}
                disabled={isGenerating}
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
                  "Generate Component"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
