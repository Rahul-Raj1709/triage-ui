import { useState } from "react";
import TriageDashboard from "@/components/ui/TriageDashboard";
import UiDeveloperDashboard from "@/components/ui/UiDeveloperDashboard";

function App() {
  const [activeTab, setActiveTab] = useState<"sre" | "ui">("ui");

  // UI Dashboard State
  const [problemDescription, setProblemDescription] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [uiIsGenerating, setUiIsGenerating] = useState(false);
  const [uiCopied, setUiCopied] = useState(false);
  const [uiHistory, setUiHistory] = useState<
    Array<{ id: string; title: string }>
  >([]);

  // SRE Dashboard State
  const [serviceName, setServiceName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [report, setReport] = useState("");
  const [sreIsGenerating, setSreIsGenerating] = useState(false);
  const [sreCopied, setSreCopied] = useState(false);
  const [sreHistory, setSreHistory] = useState<
    Array<{ id: string; title: string }>
  >([]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      {activeTab === "sre" && (
        <TriageDashboard
          serviceName={serviceName}
          setServiceName={setServiceName}
          alertMessage={alertMessage}
          setAlertMessage={setAlertMessage}
          report={report}
          setReport={setReport}
          isGenerating={sreIsGenerating}
          setIsGenerating={setSreIsGenerating}
          copied={sreCopied}
          setCopied={setSreCopied}
          history={sreHistory}
          setHistory={setSreHistory}
        />
      )}
      {activeTab === "ui" && (
        <UiDeveloperDashboard
          problemDescription={problemDescription}
          setProblemDescription={setProblemDescription}
          codeOutput={codeOutput}
          setCodeOutput={setCodeOutput}
          isGenerating={uiIsGenerating}
          setIsGenerating={setUiIsGenerating}
          copied={uiCopied}
          setCopied={setUiCopied}
          history={uiHistory}
          setHistory={setUiHistory}
        />
      )}

      {/* Tab Switcher - Floating in bottom-left corner */}
      <div className="fixed bottom-6 left-6 z-50 flex gap-2">
        <button
          onClick={() => setActiveTab("ui")}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            activeTab === "ui"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}>
          UI Agent
        </button>
        <button
          onClick={() => setActiveTab("sre")}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            activeTab === "sre"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}>
          SRE Agent
        </button>
      </div>
    </div>
  );
}

export default App;
