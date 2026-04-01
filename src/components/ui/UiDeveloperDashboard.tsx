import { useState, useRef, useEffect } from "react";
import { Copy, Check, User, Bot, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

// --- Chat Message Type ---
interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
}

export default function UiDeveloperDashboard() {
  const [problemDescription, setProblemDescription] = useState("");
  const [workspacePath, setWorkspacePath] = useState("");
  const [targetFileToRead, setTargetFileToRead] = useState("");

  // Chat Continuity State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState("");

  // New Chat Array State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStream, setCurrentStream] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const endOfLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStream]);

  // Initialize a new DB session
  const initSession = async () => {
    const res = await fetch("http://localhost:5009/api/chat/init", {
      method: "POST",
    });
    const data = await res.json();
    return data.conversationId;
  };

  const executeChat = async (isInitial: boolean) => {
    if (isInitial && !problemDescription.trim()) return;

    setIsGenerating(true);
    let currentConversationId = conversationId;

    const messageText = isInitial ? problemDescription : followUpMessage;

    if (isInitial || !currentConversationId) {
      setMessages([]);
      currentConversationId = await initSession();
      setConversationId(currentConversationId);
    } else {
      setFollowUpMessage(""); // Clear input box for follow-ups
    }

    // Add user message to UI instantly
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: messageText },
    ]);
    setCurrentStream(""); // Reset stream buffer

    try {
      const res = await fetch("http://localhost:5009/api/ui-agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversationId,
          problemDescription: messageText,
          workspacePath: workspacePath || null,
          targetFileToRead: targetFileToRead || null,
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
                console.warn("Failed to parse SSE JSON:", dataStr);
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
      console.error("Agent failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "agent",
          content:
            "**[System Error]**: Failed to connect to the UI Agent backend.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && followUpMessage.trim() && !isGenerating) {
      executeChat(false);
    }
  };

  // Helper to render Markdown components with custom Tailwind styling
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
        <h1 className="text-3xl font-bold tracking-tight text-blue-500">
          UI Developer Agent
        </h1>
        <p className="text-gray-400">
          Autonomous React/TS component generation with Workspace context.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm h-fit">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              1. Initial Requirement
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Create a pricing card component using Tailwind..."
              className="w-full px-4 py-3 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm min-h-[140px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
              disabled={isGenerating || conversationId !== null}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              2. Workspace Path
            </label>
            <input
              type="text"
              value={workspacePath}
              onChange={(e) => setWorkspacePath(e.target.value)}
              placeholder="C:\Code\MyReactApp"
              className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              disabled={isGenerating || conversationId !== null}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              3. Target File
            </label>
            <input
              type="text"
              value={targetFileToRead}
              onChange={(e) => setTargetFileToRead(e.target.value)}
              placeholder="src/App.tsx"
              className="w-full px-4 py-2.5 bg-[#141414] text-gray-200 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              disabled={isGenerating || conversationId !== null}
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              onClick={() => executeChat(true)}
              disabled={
                isGenerating ||
                !problemDescription.trim() ||
                conversationId !== null
              }
              className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
              {isGenerating && !conversationId ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{" "}
                  Initializing...
                </>
              ) : (
                "Start Session"
              )}
            </button>
            {conversationId && (
              <button
                type="button"
                onClick={() => {
                  setConversationId(null);
                  setMessages([]);
                  setCurrentStream("");
                }}
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-gray-700">
                <RotateCcw size={16} /> Reset Context
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Modern Chat UI */}
        <div className="lg:col-span-3 flex flex-col bg-[#141414] rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-0 relative">
          {/* Top Bar */}
          <div className="flex items-center px-6 py-4 border-b border-gray-800 bg-[#1a1a1a] shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200">UiAgent</h3>
                <p className="text-xs text-gray-500">React & Tailwind Expert</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-[#141414]">
            {messages.length === 0 && !isGenerating && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
                <Bot size={56} className="opacity-20" />
                <p className="text-sm">
                  Awaiting instructions... Start a session from the left panel.
                </p>
              </div>
            )}

            {/* Render Permanent Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md ${msg.role === "user" ? "bg-blue-600" : "bg-purple-600"}`}>
                  {msg.role === "user" ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-4 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-[#1e1e1e] border border-gray-800"}`}>
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {/* Render Live Streaming Message */}
            {isGenerating && currentStream && (
              <div className="flex gap-4 flex-row">
                <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md bg-purple-600">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="max-w-[85%] rounded-2xl px-6 py-4 bg-[#1e1e1e] border border-gray-800">
                  <ReactMarkdown components={markdownComponents}>
                    {currentStream}
                  </ReactMarkdown>
                  <span className="animate-pulse ml-1 text-blue-400 font-bold">
                    ▋
                  </span>
                </div>
              </div>
            )}
            <div ref={endOfLogRef} />
          </div>

          {/* Follow-up Chat Input */}
          {conversationId && (
            <div className="p-4 bg-[#1a1a1a] border-t border-gray-800 shrink-0">
              <div className="max-w-4xl mx-auto flex gap-3 relative">
                <input
                  type="text"
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow-up question or request changes..."
                  disabled={isGenerating || !conversationId}
                  className="flex-grow p-4 rounded-xl bg-[#252526] text-gray-100 border border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-500 disabled:opacity-50 text-sm shadow-inner transition-colors"
                />
                <button
                  onClick={() => executeChat(false)}
                  disabled={
                    isGenerating || !conversationId || !followUpMessage.trim()
                  }
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm flex items-center gap-2 shadow-lg">
                  {isGenerating ? "Working..." : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
