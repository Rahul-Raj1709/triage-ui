import { useState, useRef, useEffect } from "react";
import { Copy, Check, User, Bot, RotateCcw, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TriageResult {
  severity: "Critical" | "High" | "Warning" | "Low";
  rootCause: string;
  recommendedAction: string;
  requiresCodeChange: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
}

// --- Isolated Code Block Component ---
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
};

export default function TriageDashboard() {
  const [serviceName, setServiceName] = useState("PaymentAPI");
  const [alertMessage, setAlertMessage] = useState(
    "High response times detected and memory spiking",
  );
  const [mode, setMode] = useState<"json" | "stream">("stream");

  // Chat Continuity State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [jsonResult, setJsonResult] = useState<TriageResult | null>(null);

  // New Chat Array State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStream, setCurrentStream] = useState("");

  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStream, jsonResult]);

  // Helper to initialize a new DB session
  const initSession = async () => {
    const res = await fetch("http://localhost:5009/api/chat/init", {
      method: "POST",
    });
    const data = await res.json();
    return data.conversationId;
  };

  const executeChat = async (isInitial: boolean) => {
    setLoading(true);
    let currentConversationId = conversationId;

    const messageText = isInitial
      ? `Triage this alert: ${serviceName} - ${alertMessage}`
      : followUpMessage;

    if (isInitial || !currentConversationId) {
      setJsonResult(null);
      setMessages([]);
      currentConversationId = await initSession();
      setConversationId(currentConversationId);
    } else {
      setFollowUpMessage(""); // Clear input box
    }

    // Append User message to the UI instantly
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: messageText },
    ]);
    setCurrentStream("");

    try {
      if (mode === "json" && isInitial) {
        const res = await fetch("http://localhost:5009/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceName, alertMessage }),
        });
        const data = await res.json();
        setJsonResult(data);
        setLoading(false);
        return;
      }

      // Stream Mode (Continuous Chat)
      const res = await fetch("http://localhost:5009/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: messageText,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // FIX: Separate network buffer from text accumulator
      let sseBuffer = "";
      let fullText = "";
      let doneReading = false;

      while (!doneReading) {
        const { value, done } = await reader.read();
        doneReading = done;

        if (value) {
          sseBuffer += decoder.decode(value, { stream: true });
          const parts = sseBuffer.split("\n\n");

          sseBuffer = parts.pop() || ""; // Keep incomplete chunk in network buffer

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
                  // Safely accumulate the actual markdown text
                  fullText += parsed.text;
                  setCurrentStream(fullText);
                }
              } catch (err) {
                console.warn("Failed to parse SSE:", dataStr);
              }
            }
          }
        }
      }

      // Save to permanent array only if we actually got text
      if (fullText.trim()) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "agent", content: fullText },
        ]);
      }
      setCurrentStream("");
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "agent",
          content: "**[System Error]**: Connection failed.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && followUpMessage.trim() && !loading) {
      executeChat(false);
    }
  };

  // Custom Markdown components mapping
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-3 text-white" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-bold mt-5 mb-2 text-white" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="mb-4 text-gray-300 leading-relaxed last:mb-0" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        className="list-decimal pl-6 mb-4 space-y-2 text-gray-300"
        {...props}
      />
    ),
    li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-gray-100" {...props} />
    ),
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          code={String(children).replace(/\n$/, "")}
        />
      ) : (
        <code
          className="bg-[#141414] px-1.5 py-0.5 rounded-md text-blue-300 font-mono text-sm border border-gray-700"
          {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-24 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-purple-500">
          System Triage Agent
        </h1>
        <p className="text-gray-400">
          Autonomous SRE metrics gathering and incident resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm h-fit">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Target Service
            </label>
            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Alert Message
            </label>
            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="w-full px-4 py-3 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm min-h-[100px] resize-y focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Execution Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "json" | "stream")}
              className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
              disabled={loading || conversationId !== null}>
              <option value="stream">Live Multi-Agent Stream</option>
              <option value="json">Fast Structured JSON</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => executeChat(true)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
              {loading && !conversationId ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{" "}
                  Starting...
                </>
              ) : (
                "Start Triage"
              )}
            </button>
            {conversationId && (
              <button
                onClick={() => {
                  setConversationId(null);
                  setMessages([]);
                  setCurrentStream("");
                  setJsonResult(null);
                }}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-gray-700">
                <RotateCcw size={16} /> Reset Session
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Chat/Results UI */}
        <div className="lg:col-span-3 flex flex-col bg-[#141414] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-0 relative">
          {/* Top Bar */}
          <div className="flex items-center px-6 py-4 border-b border-gray-800 bg-[#1a1a1a] shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200">
                  System Triage Squad
                </h3>
                <p className="text-xs text-gray-500">SRE & Developer Agents</p>
              </div>
            </div>
          </div>

          {/* JSON Mode Display */}
          {mode === "json" && jsonResult && (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      jsonResult.severity === "Critical"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : jsonResult.severity === "High"
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                    {jsonResult.severity} SEVERITY
                  </span>
                  {jsonResult.requiresCodeChange && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                      CODE CHANGE REQUIRED
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Root Cause
                  </h3>
                  <p className="text-base font-medium text-gray-200 leading-relaxed">
                    {jsonResult.rootCause}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Recommended Action
                  </h3>
                  <p className="text-base font-medium text-gray-200 leading-relaxed">
                    {jsonResult.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stream Mode Display */}
          {mode === "stream" && (
            <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-[#141414]">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
                  <AlertTriangle size={56} className="opacity-20" />
                  <p className="text-sm">
                    Awaiting alert... Click 'Start Triage' to begin analysis.
                  </p>
                </div>
              )}

              {/* Render Permanent Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md ${msg.role === "user" ? "bg-purple-600" : "bg-[#1e1e1e] border border-gray-700"}`}>
                    {msg.role === "user" ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-gray-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-6 py-4 ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-[#1e1e1e] border border-gray-800"}`}>
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm">
                        {msg.content}
                      </p>
                    ) : (
                      <ReactMarkdown components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}

              {/* Render Live Streaming Message */}
              {loading && currentStream && (
                <div className="flex gap-4 flex-row">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md bg-[#1e1e1e] border border-gray-700">
                    <Bot size={16} className="text-gray-300" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl px-6 py-4 bg-[#1e1e1e] border border-gray-800">
                    <ReactMarkdown components={markdownComponents}>
                      {currentStream}
                    </ReactMarkdown>
                    <span className="animate-pulse ml-1 text-purple-400 font-bold">
                      ▋
                    </span>
                  </div>
                </div>
              )}
              <div ref={endOfLogRef} />
            </div>
          )}

          {/* Follow-up Chat Input (Only visible in stream mode) */}
          {mode === "stream" && conversationId && (
            <div className="p-4 bg-[#1a1a1a] border-t border-gray-800 shrink-0">
              <div className="max-w-4xl mx-auto flex gap-3 relative">
                <input
                  type="text"
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow-up question..."
                  disabled={loading || !conversationId}
                  className="flex-grow p-4 rounded-xl bg-[#252526] text-gray-100 border border-gray-700 focus:outline-none focus:border-purple-500 placeholder-gray-500 disabled:opacity-50 text-sm shadow-inner transition-colors"
                />
                <button
                  onClick={() => executeChat(false)}
                  disabled={
                    loading || !conversationId || !followUpMessage.trim()
                  }
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm flex items-center gap-2 shadow-lg">
                  {loading ? "Thinking..." : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
