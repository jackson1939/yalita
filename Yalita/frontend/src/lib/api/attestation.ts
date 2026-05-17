import { api } from "./client";
import type { DataSource } from "@yalita/shared";

export const attestationApi = {
  requestReclaim: (params: { userAddress: string; providerId: DataSource }) =>
    api.post<{ requestUrl: string }>("/oracle/reclaim/request", params),

  submit: (params: {
    user: string;
    dataSource: DataSource;
    txCount: number;
    totalVolumeBs: number;
    monthsCovered: number;
  }) => api.post<{ proofHash: string; attestationTx: string; scoreTx: string }>(
    "/attestation/submit",
    params
  ),

  list: (address: string) =>
    api.get<Array<{ id: string; createdAt: string; txCount: number }>>(
      `/attestation/${address}`,
      { skipAuth: true }
    ),
};
