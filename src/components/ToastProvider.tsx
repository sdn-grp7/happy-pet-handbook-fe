import { useCallback, useEffect, useState, type ReactNode } from "react";
import { bindToast, unbindToast, type ToastType } from "@/shared/lib/toast";
import { Toast } from "@/components/ui/toast";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => {
    bindToast(showToast);
    return () => unbindToast();
  }, [showToast]);

  return (
    <>
      {children}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2">
        {toasts.map((item) => (
          <Toast
            key={item.id}
            id={item.id}
            message={item.message}
            type={item.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </>
  );
}
