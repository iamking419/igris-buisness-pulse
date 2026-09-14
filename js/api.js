/**
 * IGRIS Business Pulse — central API configuration.
 *
 * Change BASE_URL to point at the FastAPI backend when ready.
 * Leave empty or keep localhost for local development without a backend.
 *
 * Local example:  "http://localhost:8000/api/v1"
 * Production:     "https://api.example.com/api/v1"
 */
// Runtime-configurable API base. Prefer `window.__ENV.API_BASE_URL` when present.
const API_CONFIG = {
  BASE_URL:
    (typeof window !== "undefined" && window.__ENV && (window.__ENV.API_BASE_URL || window.__ENV.VITE_API_URL)) ||
    (typeof window !== "undefined" && (window.API_BASE_URL || window.VITE_API_URL)) ||
    "http://127.0.0.1:8000/api/v1",
};

