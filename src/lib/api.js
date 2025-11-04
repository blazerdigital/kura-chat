// src/lib/api.js
// Handles API base URL selection and secure request headers

// 1️⃣ Determine API base URL
// Prefer env variable (VITE_KURA_API_BASE or VITE_API_BASE_URL).
// In dev, default to localhost:8000 (no HTTPS required).
// In production, fall back to the Cloudflare domain.
const configuredBase =
  (import.meta.env.VITE_KURA_API_BASE ||
    import.meta.env.VITE_API_BASE_URL ||
    "").trim();

let base = configuredBase;

// If no env var defined, choose default based on environment
if (!base) {
  base = import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://api.blazerdigital.com";
}

// Force HTTPS for any http:// string in production builds
if (!import.meta.env.DEV) {
  base = base.replace(/^http:\/\//i, "https://");
}

// Normalize trailing slash
export const API_BASE = base.endsWith("/") ? base.slice(0, -1) : base;

// 2️⃣ URL builder
export const buildApiUrl = (path) => {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
};

// 3️⃣ Auth header helper
export const apiHeaders = (token) =>
  token
    ? {
        Authorization: `Basic ${token}`,
      }
    : undefined;
