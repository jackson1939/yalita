import { env } from "../lib/env";

export type WavyRiskTier = "low" | "medium" | "high";

export type WavyRiskScore = {
  riskScore: number;
  tier: WavyRiskTier;
  flags: string[];
};

const MOCK_RISK_SCORE: WavyRiskScore = {
  riskScore: 75,
  tier: "medium",
  flags: [],
};

export class WavyNodeService {
  async getRiskScore(walletAddress: string): Promise<WavyRiskScore> {
    const useMock = env.WAVY_NODE_MOCK === "true" || !env.WAVY_NODE_API_KEY;
    if (useMock) return MOCK_RISK_SCORE;

    try {
      const url = new URL("/v1/risk-score", env.WAVY_NODE_API_URL);
      url.searchParams.set("address", walletAddress);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.WAVY_NODE_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Wavy Node API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as Partial<WavyRiskScore>;
      if (
        typeof data.riskScore !== "number" ||
        (data.tier !== "low" && data.tier !== "medium" && data.tier !== "high") ||
        !Array.isArray(data.flags)
      ) {
        throw new Error("Invalid Wavy Node response shape");
      }

      return {
        riskScore: data.riskScore,
        tier: data.tier,
        flags: data.flags.map(String),
      };
    } catch (error) {
      console.error("Wavy Node request failed, using mock fallback", error);
      return MOCK_RISK_SCORE;
    }
  }
}
