/**
 * IGRIS Business Pulse — API client.
 *
 * All HTTP communication with the future FastAPI backend lives here.
 * UI code and data-store never call fetch directly.
 *
 * If the backend is unavailable (network error, non-2xx, empty config),
 * callers are expected to fall back to the localStorage implementation.
 */

/**
 * Low-level request helper.
 * Returns { ok: true, data } or { ok: false, error, status }.
 * Never throws for expected network/HTTP failures.
 */
async function apiRequest(method, path, options = {}) {
  const base = (typeof API_CONFIG !== "undefined" && API_CONFIG.BASE_URL) || "";
  if (!base) {
    return { ok: false, error: "API base URL not configured", status: 0 };
  }

  const url = base.replace(/\/$/, "") + path;
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Attach auth token when available (admin routes)
  if (typeof getAuthHeaders === "function") {
    const authHeaders = getAuthHeaders();
    Object.assign(headers, authHeaders);
  }

  try {
    const fetchOpts = {
      method,
      headers,
    };
    if (options.body !== undefined) {
      fetchOpts.body =
        typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    const res = await fetch(url, fetchOpts);

    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }
    } else if (contentType.includes("text/") || contentType.includes("csv")) {
      data = await res.text();
    }

    if (res.status === 401) {
      if (typeof clearAuth === "function") {
        clearAuth();
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("igris_bp_admin_session");
      }
    }

    if (!res.ok) {
      let errorMsg = "Request failed";
      if (res.status === 401) {
        errorMsg = (data && (data.detail || data.message || data.error)) || "Unauthorized. Invalid or expired session.";
      } else if (res.status === 422) {
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map(d => d.msg || (d.loc ? `${d.loc.slice(1).join('.')}: ${d.msg}` : JSON.stringify(d))).join(", ");
          } else if (typeof data.detail === "string") {
            errorMsg = data.detail;
          } else {
            errorMsg = JSON.stringify(data.detail);
          }
        } else {
          errorMsg = "Validation error.";
        }
      } else if (res.status === 500) {
        errorMsg = "Server error. Please try again later.";
      } else if (data && (data.detail || data.message || data.error)) {
        const raw = data.detail || data.message || data.error;
        errorMsg = typeof raw === "string" ? raw : JSON.stringify(raw);
      } else {
        errorMsg = res.statusText || `Request failed with status ${res.status}`;
      }

      return {
        ok: false,
        status: res.status,
        error: errorMsg,
        data,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err) {
    // True network error, backend down, or connection refused
    return {
      ok: false,
      status: 0,
      error: "Unable to connect to IGRIS Business Pulse API. Please check your connection and try again.",
    };
  }
}

/**
 * Transform internal camelCase survey answers → backend snake_case payload.
 * Keeps frontend answer structure unchanged.
 */
function toApiSurveyPayload(answers) {
  const contactPermission =
    answers.contactPermission === "Yes" || answers.contactPermission === true;

  // Some fields may be single strings today; backend contract allows arrays.
  const asArray = (v) => {
    if (v == null || v === "") return [];
    return Array.isArray(v) ? v : [v];
  };

  return {
    business_type: answers.businessType || null,
    customer_channels: asArray(answers.customerChannels),
    biggest_challenge: answers.biggestChallenge || null,
    time_consuming_task: answers.timeConsumingTask || null,
    order_management: answers.orderManagement || null,
    payment_tracking: answers.paymentTracking || null,
    technology_used: asArray(answers.technologyUsed),
    digital_barriers: asArray(answers.digitalBarriers),
    desired_improvement: answers.desiredImprovement || null,
    contact_permission: contactPermission,
    contact: contactPermission ? answers.contact || null : null,
  };
}

/**
 * Transform backend response (snake_case) → internal camelCase record
 * so the rest of the frontend (thank-you, admin, recommendation) stays unchanged.
 */
function fromApiResponse(apiRec) {
  if (!apiRec) return null;
  return {
    id: apiRec.id || apiRec.response_id,
    createdAt: apiRec.created_at || apiRec.createdAt,
    businessType: apiRec.business_type || apiRec.businessType,
    customerChannels: Array.isArray(apiRec.customer_channels)
      ? apiRec.customer_channels[0] || ""
      : apiRec.customer_channels || apiRec.customerChannels || "",
    biggestChallenge: apiRec.biggest_challenge || apiRec.biggestChallenge,
    timeConsumingTask: apiRec.time_consuming_task || apiRec.timeConsumingTask,
    orderManagement: apiRec.order_management || apiRec.orderManagement,
    paymentTracking: apiRec.payment_tracking || apiRec.paymentTracking,
    technologyUsed: Array.isArray(apiRec.technology_used)
      ? apiRec.technology_used[0] || ""
      : apiRec.technology_used || apiRec.technologyUsed || "",
    digitalBarriers: Array.isArray(apiRec.digital_barriers)
      ? apiRec.digital_barriers[0] || ""
      : apiRec.digital_barriers || apiRec.digitalBarriers || "",
    desiredImprovement: apiRec.desired_improvement || apiRec.desiredImprovement,
    contactPermission:
      apiRec.contact_permission === true || apiRec.contact_permission === "Yes"
        ? "Yes"
        : apiRec.contactPermission === "Yes"
          ? "Yes"
          : "No",
    contact: apiRec.contact || null,
  };
}

// ---------- Public API surface ----------

async function apiSubmitSurveyResponse(answers) {
  const payload = toApiSurveyPayload(answers);
  const result = await apiRequest("POST", "/survey/responses", { body: payload });
  if (!result.ok) return result;
  // Backend is expected to return the created record (with id)
  const record = fromApiResponse(result.data);
  return { ok: true, data: record };
}

async function apiAdminLogin(password) {
  const result = await apiRequest("POST", "/admin/login", {
    body: { password },
  });
  if (result.ok && result.data) {
    // Extract JWT access_token strictly
    const token =
      result.data.access_token || result.data.token || result.data.accessToken || null;
    if (token && typeof setAuthToken === "function") {
      setAuthToken(token);
    }
  }
  return result;
}

async function apiAdminLogout() {
  try {
    return await apiRequest("POST", "/admin/logout");
  } finally {
    if (typeof clearAuth === "function") clearAuth();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("igris_bp_admin_session");
    }
  }
}

async function apiGetCurrentAdmin() {
  return apiRequest("GET", "/admin/me");
}

/**
 * @param {object} filters - optional query params
 *   business_type, challenge, contact_opt_in, search, limit, offset
 */
async function apiGetAdminResponses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.business_type) params.set("business_type", filters.business_type);
  if (filters.challenge) params.set("challenge", filters.challenge);
  if (filters.contact_opt_in !== undefined && filters.contact_opt_in !== "")
    params.set("contact_opt_in", String(filters.contact_opt_in));
  if (filters.search) params.set("search", filters.search);
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.offset != null) params.set("offset", String(filters.offset));

  const qs = params.toString();
  const path = "/admin/responses" + (qs ? `?${qs}` : "");
  const result = await apiRequest("GET", path);
  if (!result.ok) return result;

  // Accept either a bare array or { items: [...] } / { responses: [...] }
  let list = result.data;
  if (list && !Array.isArray(list)) {
    list = list.items || list.responses || list.data || [];
  }
  const mapped = (list || []).map(fromApiResponse);
  return { ok: true, data: mapped };
}

async function apiGetAdminResponse(id) {
  const result = await apiRequest("GET", `/admin/responses/${encodeURIComponent(id)}`);
  if (!result.ok) return result;
  return { ok: true, data: fromApiResponse(result.data) };
}

async function apiGetAdminInsights() {
  return apiRequest("GET", "/admin/insights");
}

async function apiExportAdminResponses() {
  return apiRequest("GET", "/admin/export", {
    headers: { Accept: "text/csv, text/plain, application/json, */*" },
  });
}
