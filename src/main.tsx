import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async'
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";
import { initAppEnvironment } from "./lib/appEnvironment";
import { initGTM } from './lib/analytics/gtm'

initAppEnvironment()

// Initialize GTM before React mounts — skipped automatically if config missing or disabled
initGTM()

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
)
