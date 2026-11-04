import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/500.css";
import "@fontsource/source-sans-3/600.css";
import { App } from "./App.tsx";
import "./styles.css";

// Standalone entry. This folder and bildschirm/index.html can move to
// consolecheat-ex7 without the Merkliste modules.

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
