// Lazy-load GSAP only if we actually animate
(async () => {
  if (!document.querySelector('.fade-in')) return;
  if (!window.gsap) {
    await new Promise(r => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      s.onload = r; document.head.appendChild(s);
    });
  }
  if (!window.ScrollTrigger) {
    await new Promise(r => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      s.onload = r; document.head.appendChild(s);
    });
  }
})();

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
          opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: i * 0.02,
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none", once: true }
        }
      );
    });
  }
});

/* ===== Sticky header background + body offset (debounced & resize-observed) ===== */
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

  // Run on load
  window.addEventListener("load", () => { setOffset(); onScroll(); });
  window.addEventListener("scroll", onScroll, { passive: true });

  // Only react when the header’s size actually changes
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(setOffset);
    ro.observe(header);
  } else {
    // last-ditch fallback for very old browsers
    window.addEventListener("resize", setOffset);
  }
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

/* ===== Build mobile comparison cards from the table (run only on MQ change) ===== */
(() => {
  const TABLE_SELECTOR = ".comparison-table";
  const WRAPPER_SELECTOR = ".table-wrapper";

  const parseTable = (table) => {
    let headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());
    let rowsEls = Array.from(table.querySelectorAll("tbody tr"));
    if (!headers.length) {
      const firstRow = table.querySelector("tr");
      if (!firstRow) return null;
      headers = Array.from(firstRow.children).map(td => td.textContent.trim());
      rowsEls = Array.from(table.querySelectorAll("tr")).slice(1);
    }
    if (headers.length < 2) return null;
    const planNames = headers.slice(1);
    const rows = rowsEls.map(tr => {
      const cells = Array.from(tr.children).map(td => td.textContent.trim());
      return { feature: cells[0] || "", values: cells.slice(1) };
    });
    return { planNames, rows };
  };

  const buildCards = () => {
    const table = document.querySelector(TABLE_SELECTOR);
    const wrapper = document.querySelector(WRAPPER_SELECTOR);
    if (!table || !wrapper) return false;
    if (document.querySelector(".comparison-cards")) return true; // already built

    const parsed = parseTable(table);
    if (!parsed) return false;

    const { planNames, rows } = parsed;
    const cards = document.createElement("div");
    cards.className = "comparison-cards";

    planNames.forEach((plan, planIdx) => {
      const card = document.createElement("div");
      card.className = "plan-card";

      const head = document.createElement("div");
      head.className = "plan-card__header";
      head.innerHTML = `<div class="plan-card__title">${plan}</div>`;

      const body = document.createElement("div");
      body.className = "plan-card__body";

      rows.forEach(({ feature, values }) => {
        const raw = (values[planIdx] || "").toLowerCase();
        let badge = `<span class="badge badge--yes" style="border-radius:6px;min-width:auto;padding:0 .5rem;">${values[planIdx] || "—"}</span>`;
        if (["✓","✔","yes","true"].some(t => raw.includes(t))) badge = `<span class="badge badge--yes">✓</span>`;
        else if (["✗","×","no","false"].some(t => raw.includes(t))) badge = `<span class="badge badge--no">×</span>`;

        const row = document.createElement("div");
        row.className = "plan-card__row";
        row.innerHTML = `<div class="feat-name">${feature}</div>${badge}`;
        body.appendChild(row);
      });

      card.appendChild(head);
      card.appendChild(body);
      cards.appendChild(card);
    });

    wrapper.after(cards);
    document.body.classList.add("has-comparison-cards");
    return true;
  };

  const destroyCards = () => {
    const cards = document.querySelector(".comparison-cards");
    if (cards) cards.remove();
    document.body.classList.remove("has-comparison-cards");
  };

  const mq = window.matchMedia("(max-width: 900px)");
  const apply = () => (mq.matches ? buildCards() : destroyCards());

  // initial + changes (no resize spam)
  apply();
  mq.addEventListener ? mq.addEventListener("change", apply) : mq.addListener(apply);
})();

/* ===== Pricing: compute addon totals & nudge emphasis ===== */
(() => {
  const ADDON_DELTA = 250; // business + personal return
  document.querySelectorAll(".plan-card").forEach(card => {
    const baseEl = card.querySelector(".price-amount");
    const addonEl = card.querySelector(".addon-amount");
    if (!baseEl || !addonEl) return;

    const base = Number(baseEl.dataset.base || baseEl.textContent.replace(/[^0-9.]/g, ""));
    const total = base + ADDON_DELTA;
    addonEl.dataset.addonTotal = total;
    addonEl.textContent = `$${total.toLocaleString()}`;
  });

  // little nudge on hover for featured
  document.querySelectorAll(".plan-card.featured").forEach(card => {
    card.addEventListener("mouseenter", () => card.classList.add("is-hot"));
    card.addEventListener("mouseleave", () => card.classList.remove("is-hot"));
  });
})();

/* ===== Reorder comparison table columns (ACS, DIY, Bookkeepers) ===== */
(() => {
  const TABLE = document.querySelector(".comparison-table");
  if (!TABLE || !TABLE.tHead || !TABLE.tHead.rows.length) return;

  const desiredOrder = ["Accounting Subcontractors", "Bookkeepers", "DIY"];

  const headRow = TABLE.tHead.rows[0];
  const headCells = Array.from(headRow.cells);
  const titles = headCells.map(th => th.textContent.trim());
  const FEATURE_COL = 0; // keep "Feature" first

  // Build target order indices: [Feature, ACS, DIY, Bookkeepers, (any others left as-is)]
  const order = [FEATURE_COL];
  desiredOrder.forEach(name => {
    const idx = titles.findIndex(t => t.toLowerCase() === name.toLowerCase());
    if (idx > 0) order.push(idx);
  });
  for (let i = 1; i < headCells.length; i++) {
    if (!order.includes(i)) order.push(i);
  }

  // Rebuild header in new order
  const newHead = document.createDocumentFragment();
  order.forEach(i => newHead.appendChild(headCells[i]));
  headRow.innerHTML = "";
  headRow.appendChild(newHead);

  // Rebuild every body row in the same order
  Array.from(TABLE.tBodies).forEach(tbody => {
    Array.from(tbody.rows).forEach(tr => {
      const tds = Array.from(tr.cells);
      const frag = document.createDocumentFragment();
      order.forEach(i => frag.appendChild(tds[i]));
      tr.innerHTML = "";
      tr.appendChild(frag);
    });
  });
})();

/* ===== FAQ: Accordion + Search ===== */
(() => {
  const list = document.getElementById('faqList');
  if (!list) return;

  // Accordion
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const item = btn.parentElement;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    item.querySelector('.faq-a').style.display = open ? 'none' : 'block';
  });

  // Search filter
  const input = document.getElementById('faqSearch');
  const items = Array.from(list.querySelectorAll('.faq-item'));
  const empty = document.createElement('div');
  empty.className = 'faq-empty';
  empty.textContent = 'No results. Try “WIP”, “job costing”, “S-Corp”, or “tax”.';
  list.parentElement.appendChild(empty);

  const norm = s => (s || '').toLowerCase().trim();
  input?.addEventListener('input', () => {
    const q = norm(input.value);
    let visible = 0;
    items.forEach(item => {
      const text = norm(item.textContent) + ' ' + norm(item.dataset.tags);
      const show = !q || text.includes(q);
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    empty.classList.toggle('show', visible === 0);
  });
})();

/* Footer year (reuse) */
(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

