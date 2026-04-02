import { useState } from "react";
import { ChatService } from "@/services/chatService";
import { TriageService } from "@/services/triageService";
import { useChat, useAutoScroll } from "@/hooks/useChat";
import { DEFAULT_TRIAGE_VALUES } from "@/constants/config";
import { TriageInputForm } from "./TriageInputForm";
import { TriageChatDisplay } from "./TriageChatDisplay";
import { TriageResultDisplay } from "./TriageResultDisplay";

export default function TriageDashboard() {
  const [serviceName, setServiceName] = useState(
    DEFAULT_TRIAGE_VALUES.SERVICE_NAME,
  );
  const [alertMessage, setAlertMessage] = useState(
    DEFAULT_TRIAGE_VALUES.ALERT_MESSAGE,
  );
  const [mode, setMode] = useState<"json" | "stream">("stream");
  const [jsonResult, setJsonResult] = useState<any>(null);

  const chat = useChat();
  const endOfLogRef = useAutoScroll([chat.messages, chat.currentStream]);

  const initSession = async () => {
    const conversationId = await ChatService.initSession();
    chat.setConversationId(conversationId);
    return conversationId;
  };

  const executeChat = async (isInitial: boolean) => {
    chat.setIsLoading(true);
    let currentConversationId = chat.conversationId;

    const messageText = isInitial
      ? `Triage this alert: ${serviceName} - ${alertMessage}`
      : chat.followUpMessage;

    if (isInitial || !currentConversationId) {
      setJsonResult(null);
      chat.setMessages([]);
      currentConversationId = await initSession();
    } else {
      chat.setFollowUpMessage("");
    }

    // Add user message
    chat.addMessage({
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    });
    chat.setCurrentStream("");

    try {
      if (mode === "json" && isInitial) {
        const result = await TriageService.getTriageResult(
          serviceName,
          alertMessage,
        );
        setJsonResult(result);
        chat.setIsLoading(false);
        return;
      }

      // Stream mode
      const fullText = await TriageService.streamTriageChat(
        currentConversationId!,
        messageText,
        (text) => chat.setCurrentStream(text),
        (error) => {
          console.error("Chat failed:", error);
          chat.addMessage({
            id: Date.now().toString(),
            role: "agent",
            content: "**[System Error]**: Connection failed.",
          });
        },
      );

      if (fullText.trim()) {
        chat.addMessage({
          id: Date.now().toString(),
          role: "agent",
          content: fullText,
        });
      }
      chat.setCurrentStream("");
    } catch (error) {
      console.error("Chat failed:", error);
    } finally {
      chat.setIsLoading(false);
    }
  };

  const handleReset = () => {
    chat.reset();
    setJsonResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          System Triage Agent
        </h1>
        <p className="text-gray-600">
          Autonomous SRE metrics gathering and incident resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Column: Input Form */}
        <TriageInputForm
          serviceName={serviceName}
          alertMessage={alertMessage}
          mode={mode}
          isLoading={chat.isLoading}
          hasConversation={chat.conversationId !== null}
          onServiceNameChange={(value) =>
            setServiceName(value as typeof serviceName)
          }
          onAlertMessageChange={(value) =>
            setAlertMessage(value as typeof alertMessage)
          }
          onModeChange={setMode}
          onStartTriage={() => executeChat(true)}
          onReset={handleReset}
        />

        {/* Right Column: Chat/Results UI */}
        <TriageChatDisplay
          mode={mode}
          messages={chat.messages}
          currentStream={chat.currentStream}
          isLoading={chat.isLoading}
          jsonResult={jsonResult}
          endOfLogRef={endOfLogRef}
          TriageResultDisplay={TriageResultDisplay}
          followUpMessage={chat.followUpMessage}
          onFollowUpChange={chat.setFollowUpMessage}
          onFollowUpSubmit={() => executeChat(false)}
          hasConversation={chat.conversationId !== null}
        />
      </div>
    </div>
  );
}
