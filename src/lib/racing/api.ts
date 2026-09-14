// Live API origin. Reads are attempted here first and fall back to the local
// demo dataset whenever the service is cold, slow, or unreachable.
export const API_ORIGIN = "https://camelvsdwarf.onrender.com";

const TIMEOUT_MS = 6000;

export type ApiSource = "live" | "demo";

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (typeof window === "undefined") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_ORIGIN}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function pingApi(): Promise<boolean> {
  const res = await apiRequest<unknown>("/health");
  return res !== null;
}
