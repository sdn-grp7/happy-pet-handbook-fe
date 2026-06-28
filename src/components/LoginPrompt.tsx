import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

type LoginPromptProps = {
  title?: string;
  message?: string;
  className?: string;
};

export function LoginPrompt({
  title = "Sign in required",
  message = "Create an account or sign in to use this feature.",
  className = "",
}: LoginPromptProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center ${className}`}
    >
      <LogIn className="h-6 w-6 mx-auto text-primary" />
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Link
        to="/login"
        className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-primary-foreground font-medium"
        style={{ background: "var(--gradient-warm)" }}
      >
        Sign in
      </Link>
    </div>
  );
}
