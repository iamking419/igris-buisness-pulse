/**
 * IGRIS Business Pulse — data layer.
 *
 * Facade over:
 *   1. FastAPI backend (via api-client.js) when available
 *   2. localStorage fallback when the backend is unreachable or unconfigured
 *
 * Public functions remain the ones used by survey.js and admin.js.
 * Call sites that previously assumed sync behaviour now treat these as async
 * (they return Promises). UI is unchanged.
 *
 * Response schema (internal / frontend):
 * {
 *   id: "BP-2026-000001",
 *   createdAt: ISOString,
 *   businessType, customerChannels, biggestChallenge, timeConsumingTask,
 *   orderManagement, paymentTracking, technologyUsed, digitalBarriers,
 *   desiredImprovement: string,
 *   contactPermission: "Yes" | "No",
 *   contact: string | null
 * }
 */

const STORAGE_KEY = "igris_bp_responses_v1";
const COUNTER_KEY = "igris_bp_id_counter_v1";

// ---------- localStorage helpers (unchanged behaviour) ----------

function _readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("IGRIS Business Pulse: failed to read responses", e);
    return [];
  }
}

function _writeAll(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function _nextId() {
  const year = new Date().getFullYear();
  let n = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10) + 1;
  localStorage.setItem(COUNTER_KEY, String(n));
  return `BP-${year}-${String(n).padStart(6, "0")}`;
}

function _localSaveResponse(answers) {
  const responses = _readAll();
  const record = {
    id: _nextId(),
    createdAt: new Date().toISOString(),
    ...answers,
  };
  responses.push(record);
  _writeAll(responses);
  return record;
}

function _localGetResponses() {
  return _readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function _localGetResponseById(id) {
  return _readAll().find((r) => r.id === id) || null;
}

function _localDeleteResponse(id) {
  const responses = _readAll().filter((r) => r.id !== id);
  _writeAll(responses);
}

function _csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function _localExportResponses() {
  const responses = _localGetResponses();
  const columns = [
    "id", "createdAt", "businessType", "customerChannels", "biggestChallenge",
    "timeConsumingTask", "orderManagement", "paymentTracking", "technologyUsed",
    "digitalBarriers", "desiredImprovement", "contactPermission", "contact",
  ];
  const rows = [columns.join(",")];
  responses.forEach((r) => {
    rows.push(columns.map((c) => _csvEscape(r[c])).join(","));
  });
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `igris-business-pulse-responses-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function _percentageBreakdown(responses, field) {
  const counts = {};
  responses.forEach((r) => {
    const v = r[field];
    if (!v) return;
    counts[v] = (counts[v] || 0) + 1;
  });
  const total = responses.length;
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      pct: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function _localCalculateInsights() {
  const responses = _localGetResponses();
  const total = responses.length;
  const today = new Date().toDateString();
  const responsesToday = responses.filter((r) => new Date(r.createdAt).toDateString() === today).length;
  const businessesRepresented = new Set(responses.map((r) => r.businessType)).size;
  const contactOptIns = responses.filter((r) => r.contactPermission === "Yes").length;

  return {
    total,
    responsesToday,
    businessesRepresented,
    contactOptIns,
    topChallenges: _percentageBreakdown(responses, "biggestChallenge"),
    topChannels: _percentageBreakdown(responses, "customerChannels"),
    topTimeConsuming: _percentageBreakdown(responses, "timeConsumingTask"),
    topBarriers: _percentageBreakdown(responses, "digitalBarriers"),
  };
}

// ---------- Public facade (API first, localStorage fallback) ----------

/**
 * Persists a completed survey response.
 * Tries the FastAPI backend; on any failure falls back to localStorage.
 * Returns a Promise that resolves to the saved record (with id).
 */
async function saveResponse(answers) {
  if (typeof apiSubmitSurveyResponse === "function") {
    try {
      const result = await apiSubmitSurveyResponse(answers);
      if (result && result.ok && result.data) {
        return result.data;
      }
      if (result && result.status && result.status !== 0) {
        throw new Error(result.error || "Survey submission failed.");
      }
    } catch (e) {
      const message = e && e.message ? e.message : "";
      const isNetworkFailure = /failed to fetch|network|fetch/i.test(message) || (e && e.status === 0);
      if (isNetworkFailure) {
        return _localSaveResponse(answers);
      }
      throw e;
    }
  }
  return _localSaveResponse(answers);
}

/**
 * Returns all responses (newest first).
 * Tries API; falls back to localStorage.
 */
async function getResponses(filters) {
  if (typeof apiGetAdminResponses === "function") {
    try {
      const result = await apiGetAdminResponses(filters || {});
      if (result && result.ok && Array.isArray(result.data)) {
        return result.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    } catch (e) {
      // fall through
    }
  }
  return _localGetResponses();
}

async function getResponseById(id) {
  if (typeof apiGetAdminResponse === "function") {
    try {
      const result = await apiGetAdminResponse(id);
      if (result && result.ok && result.data) {
        return result.data;
      }
    } catch (e) {
      // fall through
    }
  }
  return _localGetResponseById(id);
}

function deleteResponse(id) {
  // No delete endpoint specified yet — local only for prototype
  _localDeleteResponse(id);
}

async function exportResponses() {
  if (typeof apiExportAdminResponses === "function") {
    try {
      const result = await apiExportAdminResponses();
      if (result && result.ok && result.data) {
        // If backend returns CSV text
        if (typeof result.data === "string") {
          const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `igris-business-pulse-responses-${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          return;
        }
      }
    } catch (e) {
      // fall through
    }
  }
  _localExportResponses();
}

async function calculateInsights() {
  if (typeof apiGetAdminInsights === "function") {
    try {
      const result = await apiGetAdminInsights();
      if (result && result.ok && result.data) {
        // Map common backend shapes onto the shape the admin UI already expects
        const d = result.data;
        return {
          total: d.total ?? d.total_responses ?? 0,
          responsesToday: d.responses_today ?? d.responsesToday ?? 0,
          businessesRepresented: d.businesses_represented ?? d.businessesRepresented ?? 0,
          contactOptIns: d.contact_opt_ins ?? d.contactOptIns ?? 0,
          topChallenges: d.top_challenges || d.topChallenges || [],
          topChannels: d.top_channels || d.topChannels || [],
          topTimeConsuming: d.top_time_consuming || d.topTimeConsuming || [],
          topBarriers: d.top_barriers || d.topBarriers || [],
        };
      }
    } catch (e) {
      // fall through
    }
  }
  return _localCalculateInsights();
}
