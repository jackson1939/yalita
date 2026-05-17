import { api } from "./client";
import type { ScoreTier } from "@yalita/shared";

export interface ScoreResponse {
  hasScore: boolean;
  score: number | null;
  tier?: ScoreTier;
  updatedAt?: string;
  totalTxs?: number;
  volumeBs?: string;
}

export const scoreApi = {
  get: (address: string) => api.get<ScoreResponse>(`/score/${address}`, { skipAuth: true }),

  preview: (params: { txCount: number; volumeBs: number; months: number }) =>
    api.post<{ score: number; tier: ScoreTier }>("/score/preview", params, { skipAuth: true }),

  history: (address: string) =>
    api.get<Array<{ score: number; createdAt: string }>>(`/score/${address}/history`, { skipAuth: true }),
};
