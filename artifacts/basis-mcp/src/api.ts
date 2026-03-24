import {
  BASE_URL,
  API_TIMEOUT_MS,
  type ScoresResponse,
  type StablecoinDetail,
  type WalletProfile,
  type RiskiestWalletsResponse,
  type BacklogResponse,
  type MethodologyResponse,
} from "./config.js";

async function apiFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (res.status === 404) {
      return { __status: 404 } as unknown as T;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Request timed out after 10s");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

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
