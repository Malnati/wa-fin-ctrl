// cloud/ui/src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const ROOT_ELEMENT_ID = "root";

const rootElement = document.getElementById(ROOT_ELEMENT_ID);

if (!rootElement) {
  throw new Error(`Elemento raiz com id "${ROOT_ELEMENT_ID}" não encontrado.`);
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
