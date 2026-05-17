import { useAppStore } from "@/stores";
import { COPY, type CopyKey } from "@/lib/copy";

/**
 * Hook que devuelve el copy correcto según el modo de UI seleccionado.
 *
 * @example
 *   const t = useCopy();
 *   t("wallet") → "Tu cuenta digital" (modo simple)
 *                 "Wallet address"    (modo advanced)
 */
export function useCopy() {
  const mode = useAppStore((s) => s.uiMode);
  return (key: CopyKey): string => COPY[mode][key];
}
