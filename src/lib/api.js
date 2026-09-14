// Lightweight ES module wrapper for API config — preserves original API_CONFIG semantics
export const API_CONFIG = {
  BASE_URL:
    (typeof window !== 'undefined' && window.__ENV && window.__ENV.API_BASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    'http://127.0.0.1:8000/api/v1',
};
