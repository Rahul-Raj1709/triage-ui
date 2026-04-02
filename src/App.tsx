import { useState } from "react";
import { TriageDashboard } from "@/components/dashboards/triage";
import { UiDeveloperDashboard } from "@/components/dashboards/ui-developer";

function App() {
  const [activeTab, setActiveTab] = useState<"sre" | "ui">("ui");

  return (
    <div className="w-screen h-screen overflow-hidden bg-white">
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

      {/* Tab Switcher - Centered at top - Minimal anime style */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-1 bg-white border border-gray-300 rounded-lg p-1 shadow-md">
        <button
          onClick={() => setActiveTab("ui")}
          className={`px-4 py-2 rounded font-medium transition-all text-sm ${
            activeTab === "ui"
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black"
          }`}>
          UI Agent
        </button>
        <button
          onClick={() => setActiveTab("sre")}
          className={`px-4 py-2 rounded font-medium transition-all text-sm ${
            activeTab === "sre"
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black"
          }`}>
          SRE Triage
        </button>
      </div>
    </div>
  );
}

export default App;
