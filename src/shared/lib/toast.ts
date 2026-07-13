export type ToastType = "success" | "error" | "info";

type ShowToast = (message: string, type: ToastType) => void;
type QueuedToast = { message: string; type: ToastType };

let showToastImpl: ShowToast | null = null;
const queue: QueuedToast[] = [];

export function bindToast(show: ShowToast) {
  showToastImpl = show;
  if (queue.length === 0) return;
  const pending = queue.splice(0, queue.length);
  for (const item of pending) show(item.message, item.type);
}

export function unbindToast() {
  showToastImpl = null;
}

function emit(message: string, type: ToastType) {
  const text = message.trim() || (type === "error" ? "Có lỗi xảy ra." : "OK");
  if (showToastImpl) {
    showToastImpl(text, type);
    return;
  }
  queue.push({ message: text, type });
}

export const toast = {
  success: (message: string) => emit(message, "success"),
  error: (message: string) => emit(message, "error"),
  info: (message: string) => emit(message, "info"),
};
