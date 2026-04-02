export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
}

export interface TriageResult {
  severity: "Critical" | "High" | "Warning" | "Low";
  rootCause: string;
  recommendedAction: string;
  requiresCodeChange: boolean;
}

export interface StreamEvent {
  text?: string;
}
