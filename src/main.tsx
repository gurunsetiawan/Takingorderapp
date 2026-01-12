
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import { IS_DEMO } from "./utils/api";
  import { installMockApi } from "./demo/mockApi";

  if (IS_DEMO) {
    installMockApi();
  }

  createRoot(document.getElementById("root")!).render(<App />);
  
