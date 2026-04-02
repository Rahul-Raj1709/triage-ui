export const API_BASE_URL = "http://localhost:5009";

export const API_ENDPOINTS = {
  CHAT_INIT: "/api/chat/init",
  CHAT_STREAM: "/api/chat/stream",
  TRIAGE: "/api/triage",
  UI_AGENT_STREAM: "/api/ui-agent/stream",
} as const;

export const STREAM_MARKERS = {
  DONE: "[DONE]",
  DATA_PREFIX: "data: ",
} as const;

export const COPY_FEEDBACK_TIMEOUT = 2000;

export const DEFAULT_TRIAGE_VALUES = {
  SERVICE_NAME: "PaymentAPI",
  ALERT_MESSAGE: "High response times detected and memory spiking",
} as const;
