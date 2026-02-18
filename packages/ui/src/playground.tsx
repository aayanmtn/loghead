import React from "react";
import { createRoot } from "react-dom/client";
import { LogheadDashboard } from "./LogheadDashboard";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <div className="h-screen w-screen overflow-hidden">
        <LogheadDashboard />
      </div>
    </React.StrictMode>,
  );
}
