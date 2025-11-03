const rawBase = (import.meta.env.VITE_KURA_API_BASE || "").trim();
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

export const buildApiUrl = (path) => {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
};

export const apiHeaders = (token) =>
  token
    ? {
        Authorization: `Basic ${token}`,
      }
    : undefined;
