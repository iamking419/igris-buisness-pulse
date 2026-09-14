/**
 * IGRIS Business Pulse — admin dashboard.
 * Depends on QUESTIONS (data/questions.js), data-store, api, auth, api-client.
 *
 * Real login is performed through POST /api/v1/admin/login and verified with
 * GET /api/v1/admin/me. No prototype password is kept in the source.
 */

const SESSION_KEY = "igris_bp_admin_session";

(function () {
  const loginScreen = document.getElementById("admin-login");
  const dashboard = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("btn-logout");

  function isAuthed() {
    if (typeof isAdminAuthed === "function") return isAdminAuthed();
    return sessionStorage.getItem(SESSION_KEY) === "true";
  }

  function showDashboard() {
    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
    initDashboard();
  }

  function showLogin() {
    dashboard.classList.add("hidden");
    loginScreen.classList.remove("hidden");
  }

  async function verifySession() {
    const token = typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) {
      if (typeof clearAuth === "function") clearAuth();
      sessionStorage.removeItem(SESSION_KEY);
      showLogin();
      return;
    }

    if (typeof apiGetCurrentAdmin !== "function") {
      showLogin();
      return;
    }

    const result = await apiGetCurrentAdmin();
    if (result && result.ok) {
      sessionStorage.setItem(SESSION_KEY, "true");
      showDashboard();
      return;
    }

    if (typeof clearAuth === "function") clearAuth();
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  }

  window.addEventListener("admin:unauthorized", () => {
    showLogin();
    loginError.textContent = "Session expired. Please log in again.";
    loginError.classList.remove("hidden");
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById("password-input");
    const password = passwordInput.value.trim();
    loginError.classList.add("hidden");

    if (!password) {
      loginError.textContent = "Please enter your admin password.";
      loginError.classList.remove("hidden");
      return;
    }

    if (typeof apiAdminLogin !== "function") {
      loginError.textContent = "Admin API client is not available.";
      loginError.classList.remove("hidden");
      return;
    }

    try {
      // Step 1 & 2: POST /api/v1/admin/login and store the JWT
      const result = await apiAdminLogin(password);
      if (result && result.ok) {
        // Step 4: Immediately verify the JWT using GET /api/v1/admin/me
        if (typeof apiGetCurrentAdmin === "function") {
          const meResult = await apiGetCurrentAdmin();
          if (meResult && meResult.ok) {
            sessionStorage.setItem(SESSION_KEY, "true");
            passwordInput.value = "";
            showDashboard();
            return;
          }

          // If /admin/me fails or returns 401: clear token and return to login
          if (typeof clearAuth === "function") clearAuth();
          sessionStorage.removeItem(SESSION_KEY);
          const meError = (meResult && meResult.error) || "Session verification failed.";
          loginError.textContent = meError;
          loginError.classList.remove("hidden");
          return;
        }

        sessionStorage.setItem(SESSION_KEY, "true");
        passwordInput.value = "";
        showDashboard();
        return;
      }

      // Login request failed
      if (typeof clearAuth === "function") clearAuth();
      sessionStorage.removeItem(SESSION_KEY);

      let message = "Invalid password.";
      if (result && result.status === 401) {
        message = result.error || "Incorrect password.";
      } else if (result && result.status === 422) {
        message = result.error || "Validation error.";
      } else if (result && result.status === 500) {
        message = "Server error. Please try again later.";
      } else if (result && result.status === 0) {
        message = result.error || "Unable to connect to IGRIS Business Pulse API. Please check your connection and try again.";
      } else if (result && result.error) {
        message = result.error;
      }
      loginError.textContent = message;
      loginError.classList.remove("hidden");
    } catch (err) {
      if (typeof clearAuth === "function") clearAuth();
      sessionStorage.removeItem(SESSION_KEY);
      loginError.textContent = "Unable to connect to IGRIS Business Pulse API. Please check your connection and try again.";
      loginError.classList.remove("hidden");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      if (typeof apiAdminLogout === "function") {
        await apiAdminLogout();
      }
    } catch (_) {
      // Network failure during logout must not leave the user locally authenticated
    } finally {
      if (typeof clearAuth === "function") clearAuth();
      sessionStorage.removeItem(SESSION_KEY);
      showLogin();
    }
  });

  const storedToken = typeof getAuthToken === "function" ? getAuthToken() : null;
  if (storedToken || isAuthed()) {
    verifySession();
  } else {
    showLogin();
  }

  function initDashboard() {
    setupNav();
    renderOverview();
    renderResponses();
    renderInsights();
    document.getElementById("btn-export").addEventListener("click", () => {
      exportResponses();
    });
  }

  function setupNav() {
    const navButtons = document.querySelectorAll("[data-panel]");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navButtons.forEach((b) => b.classList.remove("bg-[var(--ink)]", "text-white"));
        btn.classList.add("bg-[var(--ink)]", "text-white");
        document.querySelectorAll(".admin-panel").forEach((p) => p.classList.add("hidden"));
        document.getElementById(`panel-${btn.dataset.panel}`).classList.remove("hidden");
        if (btn.dataset.panel === "responses") renderResponses();
      });
    });
  }

  async function renderOverview() {
    const insights = await calculateInsights();
    document.getElementById("stat-total").textContent = insights.total;
    document.getElementById("stat-today").textContent = insights.responsesToday;
    document.getElementById("stat-businesses").textContent = insights.businessesRepresented;
    document.getElementById("stat-optins").textContent = insights.contactOptIns;

    renderBarList("overview-challenges", insights.topChallenges);
    renderBarList("overview-channels", insights.topChannels);
    renderBarList("overview-timeconsuming", insights.topTimeConsuming);
    renderBarList("overview-barriers", insights.topBarriers);
  }

  function renderBarList(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "text-sm text-[var(--muted)]";
      empty.textContent = "Not enough data yet.";
      container.appendChild(empty);
      return;
    }
    items.slice(0, 6).forEach((item) => {
      const row = document.createElement("div");
      row.className = "mb-3";
      row.innerHTML = `
        <div class="flex justify-between text-sm mb-1">
          <span>${escapeHtml(item.label)}</span>
          <span class="text-[var(--muted)]">${item.pct}%</span>
        </div>
        <div class="data-bar-track h-1.5 w-full">
          <div class="data-bar-fill h-1.5" style="width:${item.pct}%"></div>
        </div>`;
      container.appendChild(row);
    });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str ?? "";
    return d.innerHTML;
  }

  // ---- Responses: search, filter, sort ----
  let responseFilters = { search: "", businessType: "", challenge: "", optIn: "" };
  let sortState = { field: "createdAt", direction: "desc" };

  async function renderResponses() {
    const tableBody = document.getElementById("responses-tbody");
    const cardsList = document.getElementById("responses-cards");
    const all = await getResponses();

    populateFilterOptions(all);

    let filtered = all.filter((r) => {
      if (responseFilters.businessType && r.businessType !== responseFilters.businessType) return false;
      if (responseFilters.challenge && r.biggestChallenge !== responseFilters.challenge) return false;
      if (responseFilters.optIn && r.contactPermission !== responseFilters.optIn) return false;
      if (responseFilters.search) {
        const hay = JSON.stringify(r).toLowerCase();
        if (!hay.includes(responseFilters.search.toLowerCase())) return false;
      }
      return true;
    });

    filtered = sortResponses(filtered, sortState.field, sortState.direction);
    updateSortIndicators();

    tableBody.innerHTML = "";
    cardsList.innerHTML = "";

    if (!filtered.length) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `<td colspan="6" class="py-6 text-sm text-[var(--muted)]">No responses match these filters yet.</td>`;
      tableBody.appendChild(emptyRow);
      const emptyCard = document.createElement("p");
      emptyCard.className = "text-sm text-[var(--muted)] py-6";
      emptyCard.textContent = "No responses match these filters yet.";
      cardsList.appendChild(emptyCard);
      return;
    }

    filtered.forEach((r) => {
      const date = new Date(r.createdAt).toLocaleDateString();
      const tr = document.createElement("tr");
      tr.className = "border-t border-[var(--line)] cursor-pointer hover:bg-[var(--off-white)]";
      tr.innerHTML = `
        <td class="py-3 pr-4">${date}</td>
        <td class="py-3 pr-4">${escapeHtml(r.businessType)}</td>
        <td class="py-3 pr-4">${escapeHtml(r.biggestChallenge)}</td>
        <td class="py-3 pr-4">${escapeHtml(r.customerChannels)}</td>
        <td class="py-3 pr-4">${escapeHtml(r.desiredImprovement).slice(0, 40)}${r.desiredImprovement && r.desiredImprovement.length > 40 ? "…" : ""}</td>
        <td class="py-3">${r.contactPermission === "Yes" ? "Yes" : "No"}</td>`;
      tr.addEventListener("click", () => openDetail(r.id));
      tableBody.appendChild(tr);

      const card = document.createElement("button");
      card.type = "button";
      card.className = "w-full text-left border border-[var(--line)] p-4 mb-3";
      card.innerHTML = `
        <div class="flex justify-between text-xs text-[var(--muted)] mb-2">
          <span>${date}</span><span>${escapeHtml(r.id)}</span>
        </div>
        <p class="font-medium mb-1">${escapeHtml(r.businessType)}</p>
        <p class="text-sm text-[var(--muted)]">${escapeHtml(r.biggestChallenge)}</p>`;
      card.addEventListener("click", () => openDetail(r.id));
      cardsList.appendChild(card);
    });
  }

  function sortResponses(list, field, direction) {
    const sorted = [...list].sort((a, b) => {
      let va = a[field] ?? "";
      let vb = b[field] ?? "";
      if (field === "createdAt") {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return direction === "asc" ? -1 : 1;
      if (va > vb) return direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  function updateSortIndicators() {
    document.querySelectorAll(".sortable").forEach((th) => {
      if (th.dataset.field === sortState.field) {
        th.setAttribute("aria-sort", sortState.direction === "asc" ? "ascending" : "descending");
      } else {
        th.removeAttribute("aria-sort");
      }
    });
  }

  document.querySelectorAll(".sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.dataset.field;
      if (sortState.field === field) {
        sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
      } else {
        sortState = { field, direction: "asc" };
      }
      renderResponses();
    });
  });

  function populateFilterOptions(all) {
    const typeSelect = document.getElementById("filter-business-type");
    const challengeSelect = document.getElementById("filter-challenge");
    if (typeSelect.dataset.populated) return;
    const types = [...new Set(all.map((r) => r.businessType))].sort();
    const challenges = [...new Set(all.map((r) => r.biggestChallenge))].sort();
    types.forEach((t) => typeSelect.appendChild(new Option(t, t)));
    challenges.forEach((c) => challengeSelect.appendChild(new Option(c, c)));
    if (types.length) typeSelect.dataset.populated = "true";
  }

  document.addEventListener("input", (e) => {
    if (e.target.id === "search-responses") {
      responseFilters.search = e.target.value;
      renderResponses();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "filter-business-type") { responseFilters.businessType = e.target.value; renderResponses(); }
    if (e.target.id === "filter-challenge") { responseFilters.challenge = e.target.value; renderResponses(); }
    if (e.target.id === "filter-optin") { responseFilters.optIn = e.target.value; renderResponses(); }
  });

  async function openDetail(id) {
    const r = await getResponseById(id);
    if (!r) return;
    const modal = document.getElementById("response-detail");
    const body = document.getElementById("response-detail-body");
    body.innerHTML = "";
    const fields = [
      ["Response ID", r.id],
      ["Date", new Date(r.createdAt).toLocaleString()],
      ["Business type", r.businessType],
      ["Customer acquisition", r.customerChannels],
      ["Biggest challenge", r.biggestChallenge],
      ["Manual / time-consuming work", r.timeConsumingTask],
      ["Order management", r.orderManagement],
      ["Payment / records tracking", r.paymentTracking],
      ["Technology usage", r.technologyUsed],
      ["Digital barriers", r.digitalBarriers],
      ["Desired improvement", r.desiredImprovement],
      ["Contact permission", r.contactPermission],
      ["Contact details", r.contact || "—"],
    ];
    fields.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "py-3 border-b border-[var(--line)]";
      row.innerHTML = `<p class="text-xs text-[var(--muted)] mb-1">${escapeHtml(label)}</p><p class="text-[15px]">${escapeHtml(value)}</p>`;
      body.appendChild(row);
    });
    modal.classList.remove("hidden");
  }

  document.getElementById("close-detail").addEventListener("click", () => {
    document.getElementById("response-detail").classList.add("hidden");
  });

  async function renderInsights() {
    const insights = await calculateInsights();
    renderBarList("insights-channels", insights.topChannels);
    renderBarList("insights-challenges", insights.topChallenges);
    renderBarList("insights-timeconsuming", insights.topTimeConsuming);
    renderBarList("insights-barriers", insights.topBarriers);
  }
})();
