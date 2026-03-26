export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function apiFetch(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new ApiError(body.error || `HTTP ${res.status}`, res.status);
  }
  return res.json();
}

export const api = {
  generation:     (zone, window) => apiFetch(`/api/generation?zone=${zone}&window=${window}`),
  prices:         (zone, window) => apiFetch(`/api/prices?zone=${zone}&window=${window}`),
  load:           (zone, window) => apiFetch(`/api/load?zone=${zone}&window=${window}`),
  germanyMix:     ()             => apiFetch('/api/germany/generation-mix'),
};
