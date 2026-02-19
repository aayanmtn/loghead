import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import { LogheadDashboard } from "./LogheadDashboard";
const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(_jsx(React.StrictMode, { children: _jsx("div", { className: "h-screen w-screen overflow-hidden", children: _jsx(LogheadDashboard, {}) }) }));
}
