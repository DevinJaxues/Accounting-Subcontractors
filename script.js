/* ===== Fade-ins on scroll (GSAP + ScrollTrigger) ===== */
window.addEventListener("DOMContentLoaded", () => {
  if (window.gsap && window.ScrollTrigger) {
    gsap.utils.toArray(".fade-in").forEach((el, i) => {
      // Skip anything inside the sticky header (nav, logo, drawer, etc.)
      if (el.closest(".site-header")) return;

      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: i * 0.06,
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none", once: true }
        }
      );
    });
  }
});

/* ===== Sticky header background + body offset ===== */
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const setOffset = () => {
    const h = header.getBoundingClientRect().height || 72;
    document.body.style.setProperty("--header-offset", `${h}px`);
  };
  const onScroll = () => {
    if (window.scrollY > 10) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };

  window.addEventListener("load", () => { setOffset(); onScroll(); });
  window.addEventListener("resize", setOffset);
  window.addEventListener("scroll", onScroll);
})();

/* ===== Mobile nav drawer (single source of truth) ===== */
(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks  = document.querySelector(".nav-links");
  if (!navToggle || !navLinks) return;

  const toggleMenu = () => {
    navLinks.classList.toggle("show");
    document.body.classList.toggle("nav-open", navLinks.classList.contains("show"));
  };

  navToggle.addEventListener("click", toggleMenu);

  // Close on link click & ESC
  navLinks.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("show");
      document.body.classList.remove("nav-open");
    })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      navLinks.classList.remove("show");
      document.body.classList.remove("nav-open");
    }
  });
})();

/* ===== Pricing page: monthly / yearly toggle (optional) ===== */
(() => {
  const buttons = document.querySelectorAll(".toggle-button");
  if (!buttons.length) return;

  const prices = {
    bronze: { monthly: "$49", yearly: "$499" },
    silver: { monthly: "$99", yearly: "$999" },
    gold:   { monthly: "$199", yearly: "$1999" }
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode; // "monthly" or "yearly"
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".card").forEach(card => {
        const plan = card.dataset.plan;
        if (!prices[plan]) return;
        card.querySelector(".price").textContent = prices[plan][mode];
        card.querySelector(".billed").textContent = mode === "monthly" ? "Billed monthly" : "Billed annually";
      });
    });
  });
})();

/* ===== Build mobile comparison cards from the table (safe fallback) ===== */
(() => {
  const TABLE_SELECTOR = ".comparison-table";
  const WRAPPER_SELECTOR = ".table-wrapper";

  const parseTable = (table) => {
    // Try thead first
    let headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
    let rowsEls = Array.from(table.querySelectorAll("tbody tr"));

    // If no thead, assume first row is headers
    if (!headers.length) {
      const firstRow = table.querySelector("tr");
      if (!firstRow) return null;
      headers = Array.from(firstRow.children).map(td => td.textContent.trim());
      rowsEls = Array.from(table.querySelectorAll("tr")).slice(1);
    }

    if (headers.length < 2) return null; // need at least "Feature" + 1 plan

    // Plan names are headers excluding the first (feature column)
    const planNames = headers.slice(1);
    const rows = rowsEls.map(tr => {
      const cells = Array.from(tr.children).map(td => td.textContent.trim());
      const feature = cells[0] || "";
      const values = cells.slice(1);
      return { feature, values };
    });

    return { planNames, rows };
  };

  const buildCards = () => {
    const table = document.querySelector(TABLE_SELECTOR);
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    if (!table || !wrapper) return false;

    // Prevent duplicates
    if (document.querySelector(".comparison-cards")) return true;

    const parsed = parseTable(table);
    if (!parsed) return false;

    const { planNames, rows } = parsed;

    const cardsContainer = document.createElement("div");
    cardsContainer.className = "comparison-cards";

    planNames.forEach((plan, planIdx) => {
      const card = document.createElement("div");
      card.className = "plan-card";

      const header = document.createElement("div");
      header.className = "plan-card__header";
      const title = document.createElement("div");
      title.className = "plan-card__title";
      title.textContent = plan;
      header.appendChild(title);

      const body = document.createElement("div");
      body.className = "plan-card__body";

      rows.forEach(({ feature, values }) => {
        const row = document.createElement("div");
        row.className = "plan-card__row";

        const name = document.createElement("div");
        name.className = "feat-name";
        name.textContent = feature;

        const raw = (values[planIdx] || "").toLowerCase();
        let badgeHTML;
        if (["✓","✔","yes","true"].some(t => raw.includes(t))) {
          badgeHTML = `<span class="badge badge--yes">✓</span>`;
        } else if (["✗","×","no","false"].some(t => raw.includes(t))) {
          badgeHTML = `<span class="badge badge--no">×</span>`;
        } else {
          const val = values[planIdx] || "—";
          badgeHTML = `<span class="badge badge--yes" style="border-radius:6px; min-width:auto; padding:0 .5rem;">${val}</span>`;
        }

        row.appendChild(name);
        row.insertAdjacentHTML("beforeend", badgeHTML);
        body.appendChild(row);
      });

      card.appendChild(header);
      card.appendChild(body);
      cardsContainer.appendChild(card);
    });

    // Insert cards AFTER the wrapper
    wrapper.after(cardsContainer);
    return true;
  };

  const updateLayout = () => {
    if (window.innerWidth < 900) {
      const ok = buildCards();
      document.body.classList.toggle("has-comparison-cards", ok);
    } else {
      document.body.classList.remove("has-comparison-cards");
      const cards = document.querySelector(".comparison-cards");
      if (cards) cards.remove();
    }
  };

  window.addEventListener("load", updateLayout);
  window.addEventListener("resize", updateLayout);
})();