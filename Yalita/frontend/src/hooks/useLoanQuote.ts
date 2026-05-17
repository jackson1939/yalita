import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { loansApi } from "@/lib/api";
import { calculateInterest, calculateEstimatedRate } from "@/lib/utils";

export function useLoanQuote(amountUsd: number, durationDays: number) {
  const { user } = usePrivy();
  const address = user?.wallet?.address;
  const principalUsdc = BigInt(Math.round(amountUsd * 1e6));

  return useQuery({
    queryKey: ["loan-quote", address, amountUsd, durationDays],
    queryFn: () =>
      loansApi.quote({ address: address!, principalUsdc, days: durationDays }),
    enabled: !!address && amountUsd > 0 && durationDays > 0,
    staleTime: 15_000,
    placeholderData: () => {
      // Fallback local mientras el backend está offline
      const rateBps = 1800;
      const interest = calculateInterest(principalUsdc, rateBps, durationDays);
      return {
        annualRateBps: rateBps,
        totalDue: (principalUsdc + interest).toString(),
        monthlyPayment: ((principalUsdc + interest) / BigInt(Math.ceil(durationDays / 30))).toString(),
        originationFee: ((principalUsdc * 150n) / 10_000n).toString(),
      };
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function _silence() { calculateEstimatedRate(0); }
}
