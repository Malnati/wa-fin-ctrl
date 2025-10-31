// cloud/ui/src/App.tsx

import { useEffect } from "react";
import { ReportsDashboard } from "./components/reports/ReportsDashboard";
import { UI_DOCUMENT_TITLE } from "./constants/constants";
import "./App.css";

const APP_WRAPPER_CLASS = "app-shell";

function App() {
  useEffect(() => {
    document.title = UI_DOCUMENT_TITLE;
  }, []);

  return (
    <div className={APP_WRAPPER_CLASS}>
      <ReportsDashboard />
    </div>
  );
}

export default App;
