import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";
import { initAppEnvironment } from "./lib/appEnvironment";

initAppEnvironment();

createRoot(document.getElementById("root")!).render(<App />);
