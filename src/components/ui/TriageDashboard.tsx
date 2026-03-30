import { useState, useRef, useEffect } from "react";

interface TriageResult {
  severity: "Critical" | "High" | "Warning" | "Low";
  rootCause: string;
  recommendedAction: string;
  requiresCodeChange: boolean;
}

export default function TriageDashboard() {
  const [serviceName, setServiceName] = useState("PaymentAPI");
  const [alertMessage, setAlertMessage] = useState("Network Latency");
  const [mode, setMode] = useState<"json" | "stream">("stream");

  const [loading, setLoading] = useState(false);
  const [jsonResult, setJsonResult] = useState<TriageResult | null>(null);
  const [streamLog, setStreamLog] = useState<string>("");

  const endOfLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the stream log as the agents type
  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamLog]);

  const runTriage = async () => {
    setLoading(true);
    setJsonResult(null);
    setStreamLog("");

    try {
      if (mode === "json") {
        // 1. Fetch Structured JSON
        // Matches TriageEndpoints.cs -> /api/triage
        const res = await fetch("http://localhost:5009/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceName, alertMessage }),
        });

        const data = await res.json();
        setJsonResult(data);
      } else {
        // 2. Fetch Multi-Agent Stream (Server-Sent Events)
        // Matches ChatEndpoints.cs -> /api/chat/stream
        const res = await fetch("http://localhost:5009/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // The backend ContinueChatRequest expects a single 'message' field
          body: JSON.stringify({
            message: `Triage this alert: ${serviceName} - ${alertMessage}`,
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
            // Decode the network chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });

            // Split by the SSE double-newline delimiter
            const parts = buffer.split("\n\n");

            // Keep the last (potentially incomplete) chunk in the buffer
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
                    // Append the new text to the UI
                    setStreamLog((prev) => prev + parsed.text);
                  }
                } catch (err) {
                  console.warn("Failed to parse SSE JSON:", dataStr);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Triage failed:", error);
      setStreamLog(
        (prev) => prev + "\n\n**[System Error]**: Connection failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          System Triage Agent
        </h1>
        <p className="text-gray-500">
          Autonomous SRE metrics gathering and incident resolution.
        </p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Service</label>
          <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Alert Message</label>
          <input
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="col-span-full flex items-center gap-4 mt-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "json" | "stream")}
            className="p-2 border rounded-md bg-gray-50">
            <option value="stream">Live Multi-Agent Stream</option>
            <option value="json">Fast Structured JSON</option>
          </select>

          <button
            onClick={runTriage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50">
            {loading ? "Agents are working..." : "Execute Triage"}
          </button>
        </div>
      </div>

      {/* Structured JSON Results Area */}
      {mode === "json" && jsonResult && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                jsonResult.severity === "Critical"
                  ? "bg-red-100 text-red-700"
                  : jsonResult.severity === "High"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}>
              {jsonResult.severity} SEVERITY
            </span>
            {jsonResult.requiresCodeChange && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                Code Fix Required
              </span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Root Cause
            </h3>
            <p className="text-lg font-medium mt-1">{jsonResult.rootCause}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Recommended Action
            </h3>
            <p className="text-lg font-medium mt-1">
              {jsonResult.recommendedAction}
            </p>
          </div>
        </div>
      )}

      {/* Streaming Results Area */}
      {mode === "stream" && (streamLog || loading) && (
        <div className="bg-slate-950 text-slate-50 border rounded-xl p-6 shadow-inner font-mono text-sm h-[500px] overflow-y-auto whitespace-pre-wrap">
          {streamLog || "Initializing SRE Agent..."}
          {loading && <span className="animate-pulse ml-1">▋</span>}
          <div ref={endOfLogRef} />
        </div>
      )}
    </div>
  );
}
