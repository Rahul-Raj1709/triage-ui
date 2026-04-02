import {
  API_BASE_URL,
  API_ENDPOINTS,
  STREAM_MARKERS,
} from "@/constants/config";
import type { StreamEvent } from "@/types/chat";

export interface UIAgentStreamRequest {
  conversationId: string;
  problemDescription: string;
  workspacePath: string | null;
  targetFileToRead: string | null;
}

export class UIAgentService {
  static async streamUIAgent(
    request: UIAgentStreamRequest,
    onChunk: (text: string) => void,
    onError: (error: Error) => void,
  ): Promise<string> {
    try {
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.UI_AGENT_STREAM}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        },
      );

      if (!res.body) throw new Error("No response body");

      return await this.processStream(res.body, onChunk);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError(err);
      throw err;
    }
  }

  private static async processStream(
    body: ReadableStream<Uint8Array>,
    onChunk: (text: string) => void,
  ): Promise<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder("utf-8");
    let sseBuffer = "";
    let fullText = "";
    let doneReading = false;

    while (!doneReading) {
      const { value, done } = await reader.read();
      doneReading = done;

      if (value) {
        sseBuffer += decoder.decode(value, { stream: true });
        const parts = sseBuffer.split("\n\n");
        sseBuffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith(STREAM_MARKERS.DATA_PREFIX)) {
            const dataStr = part.replace(STREAM_MARKERS.DATA_PREFIX, "").trim();

            if (dataStr === STREAM_MARKERS.DONE) {
              doneReading = true;
              break;
            }

            try {
              const parsed: StreamEvent = JSON.parse(dataStr);
              if (parsed.text) {
                fullText += parsed.text;
                onChunk(fullText);
              }
            } catch {
              console.warn("Failed to parse SSE JSON:", dataStr);
            }
          }
        }
      }
    }

    return fullText;
  }
}
