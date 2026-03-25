import React, { useState } from "react";
// Note: If using strict Shadcn, import these from your components/ui folder.
// e.g., import { Button } from "@/components/ui/button";

export default function TriageDashboard() {
  const [serviceName, setServiceName] = useState("PaymentAPI");
  const [alertMessage, setAlertMessage] = useState(
    "High response times detected",
  );
  const [report, setReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setReport(""); // Clear previous report
    setIsGenerating(true);

    try {
      const response = await fetch("https://localhost:7290/api/triage/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ serviceName, alertMessage }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("ReadableStream not supported");

      // 1. Get the stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // 2. Loop continuously to read the stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the raw bytes into a string
        const chunk = decoder.decode(value, { stream: true });

        // SSE data comes in lines separated by \n\n
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();

            // Check for our termination signal
            if (dataStr === "[DONE]") {
              setIsGenerating(false);
              return;
            }

            // Parse the JSON token and append it to our React state
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                setReport((prev) => prev + parsed.text);
              } catch (err) {
                // Ignore partial JSON chunks (can happen if a token gets split over the network)
                console.warn("Skipped partial chunk", dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to stream triage report:", error);
      setReport(
        (prev) => prev + "\n\n**Error:** Connection lost or timeout exceeded.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI SRE Triage Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Submit an alert to generate an autonomous incident report using local
          system tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- INPUT FORM (Left Column) --- */}
        <div className="col-span-1 space-y-4 border rounded-xl p-5 bg-card text-card-foreground shadow-sm">
          <form onSubmit={handleTriage} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Name</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Alert Message</label>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isGenerating}
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Triaging...
                </span>
              ) : (
                "Run Autonomous Triage"
              )}
            </button>
          </form>
        </div>

        {/* --- OUTPUT STREAM (Right Column) --- */}
        <div className="col-span-1 md:col-span-2 border rounded-xl p-5 bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Incident Report</h2>
          <div className="flex-1 overflow-y-auto bg-muted/30 rounded-md p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {report ? (
              report
            ) : (
              <span className="text-muted-foreground italic">
                Awaiting alert details...
              </span>
            )}

            {/* Blinking cursor effect while generating */}
            {isGenerating && (
              <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
