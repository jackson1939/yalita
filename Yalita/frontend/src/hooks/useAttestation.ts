import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { attestationApi } from "@/lib/api";
import { useToast } from "./useToast";
import { useOnboardingStore } from "@/stores";
import type { DataSource } from "@yalita/shared";

export function useRequestReclaim() {
  const { user } = usePrivy();
  const { setReclaimRequestUrl, setStep } = useOnboardingStore();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (providerId: DataSource) =>
      attestationApi.requestReclaim({
        userAddress: user?.wallet?.address ?? "",
        providerId,
      }),
    onSuccess: (data) => {
      setReclaimRequestUrl(data.requestUrl);
      setStep("verify");
      router.push("/onboarding/verificar");
    },
    onError: (err: Error) => {
      // Fallback de demo: aún avanzamos al paso de verificación simulada
      toast({ type: "warning", title: "Modo demo", message: err.message });
      setStep("verify");
      router.push("/onboarding/verificar");
    },
  });
}
