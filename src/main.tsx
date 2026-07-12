import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { I18nProvider } from "@/i18n/I18nContext";
import App from "./App";
import "./styles.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function Providers({ children }: { children: React.ReactNode }) {
  const tree = (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
  }
  return tree;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
