const configuredBase = (import.meta.env.VITE_KURA_API_BASE || "").trim();
const sanitizedBase = configuredBase
  ? configuredBase.replace(/^http:\/\//i, "https://")
  : "https://bridge.blazerdigital.com";

const API_BASE = sanitizedBase.endsWith("/")
  ? sanitizedBase.slice(0, -1)
  : sanitizedBase;

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
