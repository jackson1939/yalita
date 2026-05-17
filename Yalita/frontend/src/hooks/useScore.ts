import { useQuery } from "@tanstack/react-query";
import { scoreApi, type ScoreResponse } from "@/lib/api";

export function useScore(address: `0x${string}` | undefined) {
  return useQuery<ScoreResponse>({
    queryKey: ["score", address],
    queryFn: () => scoreApi.get(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useScorePreview(
  params: { txCount: number; volumeBs: number; months: number } | null
) {
  return useQuery({
    queryKey: ["score-preview", params],
    queryFn: () => scoreApi.preview(params!),
    enabled: !!params && params.txCount > 0,
    staleTime: 60_000,
  });
}

export function useScoreHistory(address: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["score-history", address],
    queryFn: () => scoreApi.history(address!),
    enabled: !!address,
  });
}
