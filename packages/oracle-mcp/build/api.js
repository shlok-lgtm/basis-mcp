import { apiFetch, } from "@basis/mcp-shared";
export async function fetchScores() {
    return apiFetch("/api/scores");
}
export async function fetchScoreDetail(coin) {
    return apiFetch(`/api/scores/${encodeURIComponent(coin.toLowerCase())}`);
}
export async function fetchWalletProfile(address) {
    return apiFetch(`/api/wallets/${encodeURIComponent(address)}`);
}
export async function fetchRiskiestWallets(limit) {
    return apiFetch(`/api/wallets/riskiest?limit=${limit}`);
}
export async function fetchBacklog(limit) {
    return apiFetch(`/api/backlog?limit=${limit}`);
}
export async function fetchMethodology() {
    return apiFetch("/api/methodology");
}
//# sourceMappingURL=api.js.map