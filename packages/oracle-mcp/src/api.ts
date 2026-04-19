import {
  apiFetch,
  type BacklogResponse,
  type MethodologyResponse,
  type RiskiestWalletsResponse,
  type ScoresResponse,
  type StablecoinDetail,
  type WalletProfile,
} from "@basis/mcp-shared";

export async function fetchScores(): Promise<ScoresResponse> {
  return apiFetch<ScoresResponse>("/api/scores");
}

export async function fetchScoreDetail(
  coin: string,
): Promise<StablecoinDetail & { __status?: number }> {
  return apiFetch<StablecoinDetail & { __status?: number }>(
    `/api/scores/${encodeURIComponent(coin.toLowerCase())}`,
  );
}

export async function fetchWalletProfile(
  address: string,
): Promise<WalletProfile & { __status?: number }> {
  return apiFetch<WalletProfile & { __status?: number }>(
    `/api/wallets/${encodeURIComponent(address)}`,
  );
}

export async function fetchRiskiestWallets(
  limit: number,
): Promise<RiskiestWalletsResponse> {
  return apiFetch<RiskiestWalletsResponse>(
    `/api/wallets/riskiest?limit=${limit}`,
  );
}

export async function fetchBacklog(limit: number): Promise<BacklogResponse> {
  return apiFetch<BacklogResponse>(`/api/backlog?limit=${limit}`);
}

export async function fetchMethodology(): Promise<MethodologyResponse> {
  return apiFetch<MethodologyResponse>("/api/methodology");
}
