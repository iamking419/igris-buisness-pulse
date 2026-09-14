/**
 * IGRIS Business Pulse — survey engine.
 * Depends on QUESTIONS (data/questions.js) and saveResponse (js/data-store.js).
 */
(function () {
  const DRAFT_KEY = "igris_bp_survey_draft_v1";
  const TOTAL = QUESTIONS.length;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = {
    stage: document.getElementById("survey-stage"),
    counter: document.getElementById("q-counter"),
    progressFill: document.getElementById("progress-fill"),
    back: document.getElementById("btn-back"),
    continue: document.getElementById("btn-continue"),
    liveRegion: document.getElementById("survey-live"),
  };

  let index = 0;
  let answers = {};
  let reviewing = false;

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      answers = draft.answers || {};
      index = Math.min(draft.index || 0, TOTAL - 1);
    } catch (e) {
      console.error("IGRIS Business Pulse: could not read saved survey progress", e);
    }
  }
  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, index }));
  }
  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  function currentIsAnswered(q) {
    const v = answers[q.id];
    if (q.type === "single") return Boolean(v);
    if (q.type === "text") return Boolean(v && v.trim().length > 0);
    if (q.type === "yesno") return v === "Yes" || v === "No";
    return false;
  }

  function renderProgress() {
    const n = reviewing ? TOTAL : index;
    const pct = Math.round((n / TOTAL) * 100);
    el.progressFill.style.width = pct + "%";
    el.counter.innerHTML = reviewing
      ? `<span class="mono-tag">REVIEW</span>`
      : `<span class="mono-tag">BUSINESS PULSE</span> · ${String(index + 1).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`;
  }

  function transitionIn(node) {
    if (prefersReducedMotion) return;
    node.style.opacity = "0";
    node.style.transform = "translateY(8px)";
    requestAnimationFrame(() => {
      node.style.transition = "opacity 220ms cubic-bezier(.4,0,.2,1), transform 220ms cubic-bezier(.4,0,.2,1)";
      node.style.opacity = "1";
      node.style.transform = "translateY(0)";
    });
  }

  function renderQuestion() {
    reviewing = false;
    const q = QUESTIONS[index];
    el.stage.innerHTML = "";

    const wrap = document.createElement("div");

    const prompt = document.createElement("h2");
    prompt.className = "text-2xl sm:text-3xl font-medium leading-snug mb-8";
    prompt.textContent = q.prompt;
    prompt.id = "q-prompt";
    wrap.appendChild(prompt);

    if (q.type === "single") {
      const grid = document.createElement("div");
      grid.className = "grid grid-cols-1 sm:grid-cols-2 gap-3";
      grid.setAttribute("role", "group");
      grid.setAttribute("aria-labelledby", "q-prompt");

      q.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        const selected = answers[q.id] === opt;
        btn.className =
          "answer-btn flex items-center gap-3 text-left px-5 py-4 border border-[var(--line)] text-[15px] leading-snug";
        btn.setAttribute("aria-pressed", String(selected));
        btn.innerHTML = `
          <span aria-hidden="true" class="shrink-0 w-4 h-4 rounded-full border ${selected ? "border-white bg-white" : "border-[var(--muted)]"}"></span>
          <span>${opt}</span>`;
        btn.addEventListener("click", () => {
          answers[q.id] = opt;
          saveDraft();
          goNext();
        });
        grid.appendChild(btn);
      });
      wrap.appendChild(grid);
    }

    if (q.type === "text") {
      const textarea = document.createElement("textarea");
      textarea.className =
        "w-full border border-[var(--line)] focus-visible:border-[var(--ink)] px-5 py-4 text-[15px] leading-relaxed min-h-[140px] resize-none";
      textarea.placeholder = q.placeholder || "";
      textarea.value = answers[q.id] || "";
      textarea.setAttribute("aria-label", q.prompt);
      textarea.addEventListener("input", () => {
        answers[q.id] = textarea.value;
        saveDraft();
        updateContinueState();
      });
      wrap.appendChild(textarea);
    }

    if (q.type === "yesno") {
      const row = document.createElement("div");
      row.className = "flex gap-3 mb-6";
      row.setAttribute("role", "group");
      row.setAttribute("aria-labelledby", "q-prompt");

      ["Yes", "No"].forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "answer-btn px-8 py-4 border border-[var(--line)] text-[15px]";
        btn.textContent = opt;
        btn.setAttribute("aria-pressed", String(answers[q.id] === opt));
        btn.addEventListener("click", () => {
          answers[q.id] = opt;
          if (opt === "No") answers[q.followUp.id] = "";
          saveDraft();
          renderQuestion();
          if (opt === "No") window.setTimeout(goNext, 150);
        });
        row.appendChild(btn);
      });
      wrap.appendChild(row);

      if (answers[q.id] === "Yes") {
        const label = document.createElement("label");
        label.className = "block text-sm text-[var(--muted)] mb-2";
        label.setAttribute("for", "contact-field");
        label.textContent = q.followUp.label;
        wrap.appendChild(label);

        const input = document.createElement("input");
        input.type = "text";
        input.id = "contact-field";
        input.className =
          "w-full border border-[var(--line)] focus-visible:border-[var(--ink)] px-5 py-4 text-[15px]";
        input.placeholder = q.followUp.placeholder;
        input.value = answers[q.followUp.id] || "";
        input.addEventListener("input", () => {
          answers[q.followUp.id] = input.value;
          saveDraft();
        });
        wrap.appendChild(input);
      }
    }

    el.stage.appendChild(wrap);
    transitionIn(wrap);

    el.back.disabled = index === 0;
    el.back.classList.toggle("opacity-30", index === 0);
    updateContinueState();
    renderProgress();
    announce(q.prompt);
  }

  function updateContinueState() {
    const q = QUESTIONS[index];
    const ready = currentIsAnswered(q);
    el.continue.disabled = !ready;
    el.continue.classList.toggle("opacity-30", !ready);
    el.continue.innerHTML =
      index === TOTAL - 1
        ? `Review answers <span class="arrow-glyph">→</span>`
        : `Continue <span class="arrow-glyph">→</span>`;
  }

  function announce(text) {
    if (el.liveRegion) el.liveRegion.textContent = text;
  }

  function goNext() {
    const q = QUESTIONS[index];
    if (!currentIsAnswered(q)) return;
    if (index < TOTAL - 1) {
      index += 1;
      saveDraft();
      renderQuestion();
    } else {
      renderReview();
    }
  }

  function goBack() {
    if (reviewing) {
      index = TOTAL - 1;
      renderQuestion();
      return;
    }
    if (index > 0) {
      index -= 1;
      saveDraft();
      renderQuestion();
    }
  }

  function renderReview() {
    reviewing = true;
    el.stage.innerHTML = "";

    const wrap = document.createElement("div");

    const heading = document.createElement("h2");
    heading.className = "text-2xl sm:text-3xl font-medium mb-2";
    heading.textContent = "You're almost there.";
    wrap.appendChild(heading);

    const sub = document.createElement("p");
    sub.className = "text-sm text-[var(--muted)] mb-8";
    sub.textContent = "One last look before this becomes part of the picture.";
    wrap.appendChild(sub);

    const list = document.createElement("dl");
    list.className = "divide-y divide-[var(--line)] border-t border-[var(--line)] mb-10";

    QUESTIONS.forEach((q) => {
      const row = document.createElement("div");
      row.className = "py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6";
      const dt = document.createElement("dt");
      dt.className = "text-sm text-[var(--muted)] sm:w-1/2";
      dt.textContent = q.prompt;
      const dd = document.createElement("dd");
      dd.className = "text-[15px] sm:w-1/2";
      dd.textContent = answers[q.id] || "—";
      row.appendChild(dt);
      row.appendChild(dd);
      list.appendChild(row);
    });
    wrap.appendChild(list);

    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className =
      "arrow-cta bg-[var(--ink)] text-white px-8 py-4 text-sm hover:opacity-90";
    submitBtn.innerHTML = `Submit response <span class="arrow-glyph">→</span>`;
    submitBtn.addEventListener("click", handleSubmit);
    wrap.appendChild(submitBtn);

    el.stage.appendChild(wrap);
    transitionIn(wrap);

    el.back.disabled = false;
    el.back.classList.remove("opacity-30");
    el.continue.disabled = true;
    el.continue.classList.add("hidden");
    renderProgress();
    announce("Review your answers before submitting.");
  }

  let submitting = false;
  async function handleSubmit() {
    if (submitting) return;
    submitting = true;

    const submitBtn = document.querySelector("#survey-stage button[type='button']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting…";
    }

    const errorBox = document.getElementById("submit-error") || document.createElement("p");
    errorBox.id = "submit-error";
    errorBox.className = "hidden text-sm text-[var(--ink)] mb-4";
    if (!errorBox.parentNode) {
      const review = document.getElementById("survey-stage");
      if (review && review.firstChild) {
        review.insertBefore(errorBox, review.firstChild);
      }
    }

    try {
      const record = await submitSurveyResponse(answers);
      clearDraft();
      sessionStorage.setItem("igris_bp_last_response_id", record.id);
      sessionStorage.setItem("igris_bp_last_response", JSON.stringify(record));
      window.location.href = "/thank-you";
    } catch (e) {
      submitting = false;
      errorBox.textContent = e && e.message ? e.message : "Unable to submit the survey right now. Please check your connection and try again.";
      errorBox.classList.remove("hidden");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Submit response <span class="arrow-glyph">→</span>`;
      }
      console.error("IGRIS Business Pulse: submit failed", e);
    }
  }

  /**
   * Persists the survey response via the data layer (API first,
   * localStorage fallback). Returns a Promise of the saved record.
   */
  function submitSurveyResponse(data) {
    return saveResponse(data);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !el.continue.disabled && !el.continue.classList.contains("hidden")) {
      goNext();
    }
    if (
      e.key === "Backspace" &&
      document.activeElement.tagName !== "TEXTAREA" &&
      document.activeElement.tagName !== "INPUT"
    ) {
      goBack();
    }
  });

  el.continue.addEventListener("click", goNext);
  el.back.addEventListener("click", goBack);

  loadDraft();
  renderQuestion();
})();
