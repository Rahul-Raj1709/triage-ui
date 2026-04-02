import { useState } from "react";
import { TriageDashboard } from "@/components/dashboards/triage";
import { UiDeveloperDashboard } from "@/components/dashboards/ui-developer";

function App() {
  const [activeTab, setActiveTab] = useState<"sre" | "ui">("ui");

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Render BOTH dashboards, but hide the inactive one using CSS.
        This prevents React from unmounting them, saving your state and active streams! 
      */}
      <div
        className={`h-full w-full ${activeTab === "sre" ? "block" : "hidden"}`}>
        <TriageDashboard />
      </div>

      <div
        className={`h-full w-full ${activeTab === "ui" ? "block" : "hidden"}`}>
        <UiDeveloperDashboard />
      </div>

      {/* Tab Switcher - Floating in bottom-left corner */}
      <div className="fixed bottom-6 left-6 z-50 flex gap-2">
        <button
          onClick={() => setActiveTab("ui")}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            activeTab === "ui"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}>
          UI Developer Agent
        </button>
        <button
          onClick={() => setActiveTab("sre")}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            activeTab === "sre"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}>
          SRE Triage Agent
        </button>
      </div>
    </div>
  );
}

export default App;
