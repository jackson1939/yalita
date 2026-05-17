import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DataSource } from "@yalita/shared";

type OnboardingStep = "login" | "connect" | "verify" | "done";

interface OnboardingState {
  step: OnboardingStep;
  selectedSource: DataSource | null;
  reclaimRequestUrl: string | null;
  setStep: (step: OnboardingStep) => void;
  setSelectedSource: (source: DataSource) => void;
  setReclaimRequestUrl: (url: string) => void;
  reset: () => void;
}

const INITIAL = {
  step: "login" as OnboardingStep,
  selectedSource: null,
  reclaimRequestUrl: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...INITIAL,
      setStep: (step) => set({ step }),
      setSelectedSource: (selectedSource) => set({ selectedSource }),
      setReclaimRequestUrl: (reclaimRequestUrl) => set({ reclaimRequestUrl }),
      reset: () => set(INITIAL),
    }),
    { name: "quipu-onboarding" }
  )
);
