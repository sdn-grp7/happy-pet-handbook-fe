import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { I18nProvider } from "@/i18n/I18nContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
