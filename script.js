(function () {
  const data = window.ACADEMY_DATA;
  if (!data) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function list(items, ordered = false) {
    if (!items?.length) return "";
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</${tag}>`;
  }

  function mistakesHtml(mistakes) {
    if (!mistakes?.length) return "";
    return mistakes
      .map(
        (m) => `<div class="mistake-card">
          <h4>${esc(m.mistake)}</h4>
          <p><strong>Nima uchun:</strong> ${esc(m.why)}</p>
          <p class="fix"><strong>Yechim:</strong> ${esc(m.fix)}</p>
        </div>`
      )
      .join("");
  }

  function sectionHeader(id, title, desc) {
    return `<section id="${id}" class="content-section reveal">
      <div class="section-header">
        <h2>${esc(title)}</h2>
        ${desc ? `<p>${esc(desc)}</p>` : ""}
      </div>`;
  }

  /* ── Hero stats ── */
  function renderStats() {
    const el = $("#heroStats");
    if (!el) return;
    el.innerHTML = data.stats
      .map(
        (s) => `<div class="stat-box">
          <strong>${esc(s.value)}</strong>
          <span>${esc(s.label)}</span>
        </div>`
      )
      .join("");
  }

  /* ── Sidebar ── */
  function renderSidebar() {
    const nav = $("#sidebarNav");
    if (!nav) return;

    const links = [
      { group: "Boshlash", items: [{ href: "#home", label: "Bosh sahifa" }, { href: "#intro", label: "Kirish" }, { href: "#equipment", label: "Uskunalar" }] },
      {
        group: "8 haftalik reja",
        items: data.weeks.map((w) => ({ href: `#week-${w.id}`, label: `${w.id}-hafta` })),
      },
      {
        group: "Chuqur mavzular",
        items: [
          { href: "#modules", label: "Modullar" },
          { href: "#apps", label: "Ilovalar" },
          { href: "#home-studio", label: "Uy studiyasi" },
          { href: "#content-plan", label: "Kontent rejasi" },
          { href: "#analytics", label: "Analitika" },
          { href: "#client-work", label: "Mijoz ishi" },
          { href: "#mistakes", label: "Xatolar" },
        ],
      },
      {
        group: "Ma'lumotnoma",
        items: [
          { href: "#glossary", label: "Lug'at" },
          { href: "#faq", label: "FAQ" },
        ],
      },
    ];

    nav.innerHTML = links
      .map(
        (g) =>
          `<div class="nav-group">${esc(g.group)}</div>` +
          g.items.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join("")
      )
      .join("");
  }

  /* ── Dynamic sections ── */
  function renderIntro() {
    const intro = data.intro;
    return (
      sectionHeader("intro", "Mobilografiya, SMM va Target — kirish", "Akademiyaning uchta ustuni va kimlar uchun mosligi.") +
      `<div class="card-grid">
        <article class="card"><h3>Mobilografiya</h3><p>${esc(intro.mobilography)}</p></article>
        <article class="card"><h3>SMM</h3><p>${esc(intro.smm)}</p></article>
        <article class="card"><h3>Target reklama</h3><p>${esc(intro.target)}</p></article>
        <article class="card"><h3>Kimlar uchun?</h3><p>${esc(intro.whoFor)}</p></article>
        <article class="card"><h3>Qanday foydalanish?</h3><p>${esc(intro.howToUse)}</p></article>
      </div></section>`
    );
  }

  function renderEquipment() {
    return (
      sectionHeader("equipment", "Uskunalar va byudjet", "Boshlang'ichdan professional darajagacha — nima kerak va qancha turadi.") +
      `<div class="card-grid">${data.equipment
        .map(
          (t) => `<article class="card">
            <h3>${esc(t.tier)}</h3>
            <p><strong>Byudjet:</strong> ${esc(t.budget)}</p>
            ${list(t.items)}
          </article>`
        )
        .join("")}</div></section>`
    );
  }

  function renderDay(day, weekId) {
    const id = `week-${weekId}-day-${day.day}`;
    return `<div class="day-card" id="${id}">
      <details>
        <summary><span>${day.day}-kun: ${esc(day.title)}</span></summary>
        <div class="day-body">
          <h4>Nazariya</h4>
          <p>${esc(day.theory)}</p>
          <h4>Qadamlar</h4>
          ${list(day.steps, true)}
          <h4>Amaliyot</h4>
          <p>${esc(day.practice)}</p>
          <h4>Checklist</h4>
          <div class="tag-list">${day.checklist.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</div>
          ${day.mistakes?.length ? `<h4>Tez-tez uchraydigan xatolar</h4>${mistakesHtml(day.mistakes)}` : ""}
        </div>
      </details>
    </div>`;
  }

  function renderWeeks() {
    return data.weeks
      .map(
        (w) =>
          sectionHeader(`week-${w.id}`, `${w.id}-hafta: ${w.title}`, w.goal) +
          `<div class="week-block">
            <div class="week-header">
              <h3>${w.id}-hafta — ${esc(w.title)}</h3>
              <div class="week-meta">
                <span><strong>Maqsad:</strong> ${esc(w.goal)}</span>
                <span><strong>Natija:</strong> ${esc(w.outcome)}</span>
              </div>
            </div>
            ${w.days.map((d) => renderDay(d, w.id)).join("")}
          </div></section>`
      )
      .join("");
  }

  function renderModules() {
    return (
      sectionHeader("modules", "Chuqur modullar", "Har bir mavzu bo'yicha batafsil nazariya va amaliy maslahatlar.") +
      data.modules
        .map(
          (m) => `<details class="module-card" id="module-${m.id}">
            <summary>${m.icon || ""} ${esc(m.title)}</summary>
            <div class="module-inner">${m.sections
              .map(
                (s) => `<div class="sub-section">
                  <h4>${esc(s.title)}</h4>
                  <p>${esc(s.content)}</p>
                  ${s.tips?.length ? `<div class="tip-box">${list(s.tips)}</div>` : ""}
                </div>`
              )
              .join("")}</div>
          </details>`
        )
        .join("") +
      `</section>`
    );
  }

  function renderApps() {
    return (
      sectionHeader("apps", "Ilovalar bo'yicha qo'llanma", "Har bir ilovani bosqichma-bosqich o'rganish uchun to'liq yo'riqnoma.") +
      data.apps
        .map(
          (a, i) => `<article class="app-block" id="app-${i}">
            <h3>${esc(a.name)}</h3>
            <p class="app-meta">${esc(a.category)} · ${esc(a.level)}</p>
            <p>${esc(a.description)}</p>
            <h4>Bosqichlar</h4>
            ${list(a.steps, true)}
            ${a.proTips?.length ? `<div class="tip-box"><strong>Pro maslahatlar:</strong>${list(a.proTips)}</div>` : ""}
          </article>`
        )
        .join("") +
      `</section>`
    );
  }

  function renderHomeStudio() {
    const hs = data.homeStudio;
    return (
      sectionHeader("home-studio", "Uy studiyasi", "Minimal joyda professional kontent yaratish — joy, yorug'lik, audio va fon.") +
      `<h3 style="margin-bottom:1rem;color:var(--accent-2)">Studiya sozlash</h3>
      <div class="card-grid">${hs.setup
        .map((s) => `<article class="card"><h4>${esc(s.title)}</h4><p>${esc(s.details)}</p></article>`)
        .join("")}</div>
      <h3 style="margin:2rem 0 1rem;color:var(--accent-2)">Yorug'lik turlari</h3>
      <table class="data-table">
        <thead><tr><th>Turi</th><th>Qayerda</th><th>Sozlash</th></tr></thead>
        <tbody>${hs.lightingTypes
          .map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.use)}</td><td>${esc(l.setup)}</td></tr>`)
          .join("")}</tbody>
      </table>
      <div class="card-grid" style="margin-top:1.5rem">
        <article class="card"><h4>Audio maslahatlari</h4>${list(hs.audioTips)}</article>
        <article class="card"><h4>Fon maslahatlari</h4>${list(hs.backgroundTips)}</article>
      </div></section>`
    );
  }

  function renderContentPlan() {
    const cp = data.contentPlan;
    return (
      sectionHeader("content-plan", "Kontent rejasi", "Haftalik shablon, kontent ustunlari va 30 kunlik g'oyalar.") +
      `<article class="card" style="margin-bottom:1rem"><h3>Haftalik shablon</h3><p>${esc(cp.weeklyTemplate)}</p></article>
      <h3 style="margin-bottom:1rem;color:var(--accent-2)">Kontent ustunlari</h3>
      <div class="card-grid">${cp.pillars
        .map(
          (p) => `<article class="card">
            <h4>${esc(p.name)} <span class="tag">${esc(p.share)}</span></h4>
            ${list(p.examples)}
          </article>`
        )
        .join("")}</div>
      <h3 style="margin:2rem 0 1rem;color:var(--accent-2)">30 kunlik kontent g'oyalari</h3>
      <div class="tag-list">${cp["30dayIdeas"].map((idea, i) => `<span class="tag">${i + 1}. ${esc(idea)}</span>`).join("")}</div>
      </section>`
    );
  }

  function renderAnalytics() {
    const an = data.analytics;
    return (
      sectionHeader("analytics", "Analitika va KPI", "Raqamlarni o'qish, tahlil qilish va keyingi qadamni belgilash.") +
      `<table class="data-table">
        <thead><tr><th>KPI</th><th>Formula</th><th>Yaxshi</th><th>Yomon</th><th>Harakat</th></tr></thead>
        <tbody>${an.kpis
          .map(
            (k) => `<tr>
              <td><strong>${esc(k.name)}</strong></td>
              <td>${esc(k.formula)}</td>
              <td>${esc(k.good)}</td>
              <td>${esc(k.bad)}</td>
              <td>${esc(k.action)}</td>
            </tr>`
          )
          .join("")}</tbody>
      </table>
      <h3 style="margin:2rem 0 1rem;color:var(--accent-2)">Haftalik tahlil checklist</h3>
      ${list(an.weeklyReview, true)}
      </section>`
    );
  }

  function renderClientWork() {
    const cw = data.clientWork;
    return (
      sectionHeader("client-work", "Mijoz bilan ishlash", "Narxlar, shartnoma, onboarding va yetkazib berish tizimi.") +
      `<article class="card" style="margin-bottom:1.5rem"><h3>Narxlar va paketlar</h3><p>${esc(cw.pricing)}</p></article>
      <div class="card-grid">
        <article class="card"><h4>Shartnoma bandlari</h4>${list(cw.contractPoints)}</article>
        <article class="card"><h4>Onboarding</h4>${list(cw.onboarding)}</article>
        <article class="card"><h4>Yetkazib berish</h4>${list(cw.delivery)}</article>
      </div></section>`
    );
  }

  function renderMistakes() {
    return (
      sectionHeader("mistakes", "Tez-tez uchraydigan xatolar", "Umumiy xatolar va ularni tuzatish yo'llari — barcha bo'limlar uchun.") +
      mistakesHtml(data.mistakes) +
      `</section>`
    );
  }

  function renderGlossary() {
    return (
      sectionHeader("glossary", "Terminlar lug'ati", "Barcha muhim atamalar bir joyda — tez qidirish uchun.") +
      `<dl class="glossary-grid">${data.glossary
        .map((g) => `<div class="glossary-item"><dt>${esc(g.term)}</dt><dd>${esc(g.definition)}</dd></div>`)
        .join("")}</dl></section>`
    );
  }

  function renderFaq() {
    return (
      sectionHeader("faq", "Savol-javob (FAQ)", "Eng ko'p so'raladigan savollarga to'liq javoblar.") +
      data.faq
        .map(
          (f, i) => `<details class="faq-item" id="faq-${i}">
            <summary>${esc(f.q)}</summary>
            <p>${esc(f.a)}</p>
          </details>`
        )
        .join("") +
      `</section>`
    );
  }

  function renderAll() {
    const container = $("#dynamicSections");
    if (!container) return;
    container.innerHTML =
      renderIntro() +
      renderEquipment() +
      renderWeeks() +
      renderModules() +
      renderApps() +
      renderHomeStudio() +
      renderContentPlan() +
      renderAnalytics() +
      renderClientWork() +
      renderMistakes() +
      renderGlossary() +
      renderFaq();
  }

  /* ── Search index ── */
  const searchIndex = [];

  function buildSearchIndex() {
    data.weeks.forEach((w) => {
      w.days.forEach((d) => {
        searchIndex.push({
          title: `${w.id}-hafta ${d.day}-kun: ${d.title}`,
          href: `#week-${w.id}-day-${d.day}`,
          text: [d.title, d.theory, d.practice, ...(d.steps || [])].join(" "),
          type: "Dars",
        });
      });
    });
    data.modules.forEach((m) => {
      m.sections.forEach((s) => {
        searchIndex.push({
          title: `${m.title}: ${s.title}`,
          href: `#module-${m.id}`,
          text: [s.title, s.content, ...(s.tips || [])].join(" "),
          type: "Modul",
        });
      });
    });
    data.apps.forEach((a, i) => {
      searchIndex.push({
        title: a.name,
        href: `#app-${i}`,
        text: [a.name, a.description, ...(a.steps || []), ...(a.proTips || [])].join(" "),
        type: "Ilova",
      });
    });
    data.glossary.forEach((g) => {
      searchIndex.push({ title: g.term, href: "#glossary", text: `${g.term} ${g.definition}`, type: "Lug'at" });
    });
    data.faq.forEach((f, i) => {
      searchIndex.push({ title: f.q, href: `#faq-${i}`, text: `${f.q} ${f.a}`, type: "FAQ" });
    });
    data.mistakes.forEach((m) => {
      searchIndex.push({
        title: m.mistake,
        href: "#mistakes",
        text: `${m.mistake} ${m.why} ${m.fix}`,
        type: "Xato",
      });
    });
  }

  function initSearch() {
    const input = $("#searchInput");
    const results = $("#searchResults");
    if (!input || !results) return;

    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) {
          results.hidden = true;
          return;
        }
        const hits = searchIndex
          .filter((item) => item.text.toLowerCase().includes(q) || item.title.toLowerCase().includes(q))
          .slice(0, 12);
        if (!hits.length) {
          results.innerHTML = `<a href="#">Natija topilmadi</a>`;
        } else {
          results.innerHTML = hits
            .map(
              (h) =>
                `<a href="${h.href}"><strong>${esc(h.title)}</strong><br><small style="opacity:0.7">${esc(h.type)}</small></a>`
            )
            .join("");
        }
        results.hidden = false;
      }, 200);
    });

    results.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link?.hash) {
        results.hidden = true;
        input.value = "";
        closeSidebar();
        const target = $(link.hash);
        if (target) {
          const details = target.closest("details");
          if (details) details.open = true;
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) results.hidden = true;
    });
  }

  /* ── Progress bar ── */
  function initProgress() {
    const bar = $("#progressBar");
    if (!bar) return;
    window.addEventListener(
      "scroll",
      () => {
        const doc = document.documentElement;
        const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
        bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      },
      { passive: true }
    );
  }

  /* ── Back to top ── */
  function initBackTop() {
    const btn = $("#backTop");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => btn.classList.toggle("show", window.scrollY > 400),
      { passive: true }
    );
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ── Mobile sidebar ── */
  const sidebar = $("#sidebar");
  const menuToggle = $("#menuToggle");

  function closeSidebar() {
    sidebar?.classList.remove("open");
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    sidebar.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeSidebar();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#sidebar") && !e.target.closest("#menuToggle")) closeSidebar();
    });
  }

  /* ── Active nav on scroll ── */
  function initActiveNav() {
    const links = $$(".sidebar-nav a");
    const sections = links
      .map((a) => {
        const id = a.getAttribute("href")?.slice(1);
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ── Reveal animation ── */
  function initReveal() {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );
    $$(".reveal").forEach((el) => observer.observe(el));
  }

  /* ── Init ── */
  renderStats();
  renderSidebar();
  renderAll();
  buildSearchIndex();
  initSearch();
  initProgress();
  initBackTop();
  initActiveNav();
  initReveal();
})();
