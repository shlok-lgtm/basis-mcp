import { API_TIMEOUT_MS, BASE_URL } from "./config.js";

export async function apiFetch<T>(path: string): Promise<T> {
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
