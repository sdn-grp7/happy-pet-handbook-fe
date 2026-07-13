import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getGuides } from "@/features/guides/api/guidesApi";
import type { GuideBook } from "@/features/guides/types";

type GuidesContextValue = {
  guides: GuideBook[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const GuidesContext = createContext<GuidesContextValue | null>(null);

export function GuidesProvider({ children }: { children: ReactNode }) {
  const [guides, setGuides] = useState<GuideBook[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getGuides();
      setGuides(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(() => ({ guides, loading, refresh }), [guides, loading]);

  return <GuidesContext.Provider value={value}>{children}</GuidesContext.Provider>;
}

export function useGuides() {
  const ctx = useContext(GuidesContext);
  if (!ctx) throw new Error("useGuides must be used within GuidesProvider");
  return ctx;
}
