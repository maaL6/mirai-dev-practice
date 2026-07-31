import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/app.css";

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    return;
  }
  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

enableMocking()
  .catch((err) => {
    console.error("Lỗi khởi chạy MSW (có thể do trình duyệt chặn Service Worker):", err);
  })
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
