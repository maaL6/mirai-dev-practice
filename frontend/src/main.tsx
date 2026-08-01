import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/app.css";

// Install mock API when VITE_USE_MOCK is enabled
if (import.meta.env.VITE_USE_MOCK === "true") {
  const { installMockApi } = await import("./mock/install");
  installMockApi();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
