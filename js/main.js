/**
 * IGRIS Business Pulse — homepage behavior.
 */
(function () {
  const menuBtn = document.getElementById("menu-toggle");
  const menuPanel = document.getElementById("mobile-menu");

  if (menuBtn && menuPanel) {
    menuBtn.addEventListener("click", () => {
      const isOpen = menuPanel.classList.toggle("flex");
      menuPanel.classList.toggle("hidden");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
    menuPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuPanel.classList.add("hidden");
        menuPanel.classList.remove("flex");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Reveal-on-scroll ----
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ---- Number count-up (hero metadata, big stats) ----
  const countEls = document.querySelectorAll("[data-count-to]");
  function animateCount(el) {
    const target = parseInt(el.dataset.countTo, 10);
    if (prefersReducedMotion || Number.isNaN(target)) {
      el.textContent = target;
      return;
    }
    const duration = 700;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (countEls.length) {
    if (!("IntersectionObserver" in window)) {
      countEls.forEach(animateCount);
    } else {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }
  }
})();
