/**
 * IGRIS Business Pulse — auth / token layer.
 *
 * Isolated from UI. Stores whatever token the FastAPI backend returns
 * after a successful admin login so subsequent API requests can attach it.
 *
 * Does not store passwords. Does not invent auth schemes.
 * Backend decides the token format; this layer only persists and attaches it.
 */

const AUTH_TOKEN_KEY = "igris_bp_admin_token";
const AUTH_SESSION_KEY = "igris_bp_admin_session";

function getAuthToken() {
  try {
    return (
      sessionStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("access_token") ||
      null
    );
  } catch (e) {
    return null;
  }
}

function setAuthToken(token) {
  try {
    if (token && typeof token === "string") {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_SESSION_KEY, "true");
      localStorage.setItem("admin_token", token);
      localStorage.setItem("access_token", token);
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("access_token");
    }
  } catch (e) {
    console.error("IGRIS Business Pulse: could not persist auth token", e);
  }
}

function clearAuth() {
  setAuthToken(null);
}

function clearAuthAndRedirect() {
  clearAuth();
  if (typeof window !== "undefined" && (window.location.pathname.includes("/admin") || window.location.pathname.endsWith("/admin"))) {
    window.location.href = "/admin";
  }
}

function isAdminAuthed() {
  return Boolean(getAuthToken());
}

/**
 * Returns headers suitable for authenticated admin requests.
 * Callers merge these into their fetch options.
 */
function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

