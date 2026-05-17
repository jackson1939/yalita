import { useToastStore } from "@/stores";

export function useToast() {
  return useToastStore((s) => ({ toast: s.toast, dismiss: s.dismiss, dismissAll: s.dismissAll }));
}
