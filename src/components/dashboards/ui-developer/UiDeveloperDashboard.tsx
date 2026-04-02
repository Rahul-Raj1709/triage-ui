import { useState } from "react";
import { UIAgentService } from "@/services/uiAgentService";
import { ChatService } from "@/services/chatService";
import { useChat, useAutoScroll } from "@/hooks/useChat";
import { UIAgentInputForm } from "./UIAgentInputForm";
import { UIAgentChatDisplay } from "./UIAgentChatDisplay";

export default function UiDeveloperDashboard() {
  const [problemDescription, setProblemDescription] = useState("");
  const [workspacePath, setWorkspacePath] = useState("");
  const [targetFileToRead, setTargetFileToRead] = useState("");

  const chat = useChat();
  const endOfLogRef = useAutoScroll([chat.messages, chat.currentStream]);

  const initSession = async () => {
    const conversationId = await ChatService.initSession();
    chat.setConversationId(conversationId);
    return conversationId;
  };

  const executeChat = async (isInitial: boolean) => {
    if (isInitial && !problemDescription.trim()) return;

    chat.setIsLoading(true);
    let currentConversationId = chat.conversationId;

    const messageText = isInitial ? problemDescription : chat.followUpMessage;

    if (isInitial || !currentConversationId) {
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
      const fullText = await UIAgentService.streamUIAgent(
        {
          conversationId: currentConversationId!,
          problemDescription: messageText,
          workspacePath: workspacePath || null,
          targetFileToRead: targetFileToRead || null,
        },
        (text) => chat.setCurrentStream(text),
        (error) => {
          console.error("Agent failed:", error);
          chat.addMessage({
            id: Date.now().toString(),
            role: "agent",
            content:
              "**[System Error]**: Failed to connect to the UI Agent backend.",
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
      console.error("Agent failed:", error);
    } finally {
      chat.setIsLoading(false);
    }
  };

  const handleReset = () => {
    chat.reset();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2 px-6 py-6 shrink-0 border-b border-gray-300">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          UI Developer Agent
        </h1>
        <p className="text-gray-600">
          Autonomous React/TS component generation with Workspace context.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full p-6">
          {/* Left Column: Input Form */}
          <UIAgentInputForm
            problemDescription={problemDescription}
            workspacePath={workspacePath}
            targetFileToRead={targetFileToRead}
            isGenerating={chat.isLoading}
            hasConversation={chat.conversationId !== null}
            onProblemDescriptionChange={setProblemDescription}
            onWorkspacePathChange={setWorkspacePath}
            onTargetFileChange={setTargetFileToRead}
            onStartSession={() => executeChat(true)}
            onResetContext={handleReset}
          />

          {/* Right Column: Chat Display */}
          <UIAgentChatDisplay
            messages={chat.messages}
            currentStream={chat.currentStream}
            isGenerating={chat.isLoading}
            endOfLogRef={endOfLogRef}
            onFollowUpChange={chat.setFollowUpMessage}
            onFollowUpSubmit={() => executeChat(false)}
            followUpMessage={chat.followUpMessage}
            hasConversation={chat.conversationId !== null}
          />
        </div>
      </div>
    </div>
  );
}
