const root = document.documentElement;
root.classList.add("js");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

// Theme: follows system; toggle persists (best effort). Initial value is set inline in <head>.
const toggle = document.getElementById("theme");
function isDark() {
  const t = root.getAttribute("data-theme");
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}
function paint() {
  if (!toggle) return;
  toggle.textContent = isDark() ? "☀" : "☾";
  toggle.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
}
paint();

function toggleTheme(origin) {
  const apply = () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    paint();
  };
  if (!document.startViewTransition || reduceMotion) return apply();

  // Circle that spreads out from the toggle (or from wherever the action came from)
  const r = (origin || toggle).getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add("vt-theme");
  const vt = document.startViewTransition(apply);
  vt.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 520, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" }
    );
  });
  vt.finished.finally(() => root.classList.remove("vt-theme"));
}
toggle?.addEventListener("click", () => toggleTheme(toggle));

// Toast
let toastEl, toastTimer;
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e2) {}
    ta.remove();
  }
}
const EMAIL = "m.bilal8492@gmail.com";
async function copyEmail() { await copyText(EMAIL); toast("Email copied to clipboard"); }
document.querySelectorAll("[data-copy]").forEach((b) =>
  b.addEventListener("click", async () => {
    await copyText(b.dataset.copy);
    toast(b.dataset.copy.includes("@") ? "Email copied to clipboard" : "Copied");
  })
);

// Subtle reveal on scroll
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 60}ms`;
    io.observe(el);
  });
} else {
  items.forEach((el) => el.classList.add("in"));
}

// Phone showcase: cycles app screens, tilts toward the pointer
(() => {
  const phone = document.getElementById("phone");
  if (!phone) return;
  const screens = [...phone.querySelectorAll(".screen")];
  const dots = document.getElementById("dots");
  const cap = document.getElementById("cap");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = 3800;
  let i = 0, timer = null, hovering = false, visible = true;

  // Real screenshots: <div class="screen" data-shot="screens/x.webp">
  screens.forEach((s) => {
    if (!s.dataset.shot) return;
    const img = new Image();
    img.alt = `${s.dataset.name} screenshot`;
    img.decoding = "async";
    img.onload = () => s.appendChild(img);
    img.src = s.dataset.shot;
  });

  const buttons = screens.map((s, n) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", s.dataset.name);
    b.addEventListener("click", () => { show(n); restart(); });
    dots.appendChild(b);
    return b;
  });
  dots.style.setProperty("--dur", `${DUR}ms`);

  function show(n) {
    const prev = screens[i];
    i = (n + screens.length) % screens.length;
    const s = screens[i];
    if (prev !== s) {
      prev.classList.remove("active");
      prev.classList.add("leaving");
      setTimeout(() => prev.classList.remove("leaving"), 600);
    }
    s.classList.add("active");
    buttons.forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
    if (dots.classList.contains("playing")) {
      // restart the progress-bar animation
      dots.classList.remove("playing"); void dots.offsetWidth; dots.classList.add("playing");
    }
    cap.querySelector("b").textContent = s.dataset.name;
    cap.querySelector("span").textContent = s.dataset.kind;
    cap.href = `#apps`;
  }

  function stop() { clearInterval(timer); timer = null; dots.classList.remove("playing"); }
  function restart() {
    stop();
    if (reduce || hovering || !visible || document.hidden) return;
    void dots.offsetWidth;
    dots.classList.add("playing");
    timer = setInterval(() => show(i + 1), DUR);
  }

  show(0);
  restart();

  const showcase = phone.closest(".showcase");
  showcase.addEventListener("mouseenter", () => { hovering = true; restart(); });
  showcase.addEventListener("mouseleave", () => { hovering = false; restart(); });
  document.addEventListener("visibilitychange", restart);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; restart(); }).observe(phone);
  }

  // Swipe on touch
  let x0 = null;
  phone.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  phone.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 30) { show(i + (dx < 0 ? 1 : -1)); restart(); }
    x0 = null;
  });

  // "Preview" buttons in the apps list
  document.querySelectorAll(".preview").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = screens.findIndex((s) => s.dataset.app === btn.dataset.app);
      if (n < 0) return;
      show(n);
      restart();
      phone.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });

  // Tilt toward pointer (fine pointers only)
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    const hero = phone.closest(".hero");
    let raf = 0;
    hero.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = phone.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        phone.classList.add("tracking");
        phone.style.setProperty("--ry", `${(-10 + dx * 28).toFixed(2)}deg`);
        phone.style.setProperty("--rx", `${(4 - dy * 16).toFixed(2)}deg`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf);
      phone.classList.remove("tracking");
      phone.style.removeProperty("--ry");
      phone.style.removeProperty("--rx");
    });
  }
})();

// Command palette (Ctrl/⌘ K)
(() => {
  const onHome = !!document.getElementById("experience");
  const home = onHome ? "" : "index.html";
  const go = (hash) => () => {
    if (onHome) document.querySelector(hash)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    else location.href = home + hash;
  };
  const open = (url, blank) => () => (blank ? window.open(url, "_blank", "noopener") : (location.href = url));
  const download = (href) => () => {
    const a = Object.assign(document.createElement("a"), { href, download: "" });
    document.body.appendChild(a); a.click(); a.remove();
  };

  const commands = [
    { group: "Navigate", label: "Experience", hint: "Section", run: go("#experience") },
    { group: "Navigate", label: "Skills", hint: "Section", run: go("#skills") },
    { group: "Navigate", label: "Selected apps", hint: "Section", run: go("#apps") },
    { group: "Navigate", label: "Open source projects", hint: "Section", run: go("#projects") },
    { group: "Navigate", label: "Contact", hint: "Section", run: go("#contact") },
    { group: "Navigate", label: "Resume", hint: "Page", run: open("resume.html") },
    { group: "Actions", label: "Copy email address", hint: EMAIL, run: copyEmail },
    { group: "Actions", label: "Download resume (PDF)", hint: "PDF", run: download("bilal_ansari_resume.pdf") },
    { group: "Actions", label: "Save contact card", hint: "vCard", run: download("bilal-ansari.vcf") },
    { group: "Actions", label: "Toggle light / dark theme", hint: "Theme", run: () => toggleTheme(document.getElementById("cmdk")) },
    { group: "Actions", label: "Send an email", hint: "Mail", run: open(`mailto:${EMAIL}`) },
    { group: "Links", label: "GitHub", hint: "github.com/bilal8492", run: open("https://github.com/bilal8492", true) },
    { group: "Links", label: "LinkedIn", hint: "in/bilal8492", run: open("https://linkedin.com/in/bilal8492", true) },
    { group: "Links", label: "ReelGuard", hint: "Project", run: open("https://bilalansari.in/ReelGuard/", true) },
    { group: "Links", label: "Updraft", hint: "Project", run: open("https://bilalansari.in/updraft/", true) },
  ];

  const btn = document.getElementById("cmdk");
  if (btn) btn.querySelector("kbd").textContent = isMac ? "⌘K" : "Ctrl K";

  const dlg = document.createElement("dialog");
  dlg.className = "cmdk";
  dlg.setAttribute("aria-label", "Command menu");
  dlg.innerHTML = `
    <div class="cmdk-box">
      <input class="cmdk-input" type="text" placeholder="Type a command or search…" autocomplete="off" spellcheck="false"
        role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list">
      <ul class="cmdk-list" id="cmdk-list" role="listbox" aria-label="Commands"></ul>
      <div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>esc</kbd> close</span></div>
    </div>`;
  document.body.appendChild(dlg);
  const input = dlg.querySelector("input");
  const list = dlg.querySelector("ul");
  let shown = [], sel = 0;

  function score(c, q) {
    if (!q) return 1;
    const hay = `${c.label} ${c.hint} ${c.group}`.toLowerCase();
    if (hay.includes(q)) return 2 + (c.label.toLowerCase().startsWith(q) ? 1 : 0);
    let i = 0; // loose subsequence match
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 0.5 : 0;
  }

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = commands.map((c) => [c, score(c, q)]).filter(([, s]) => s > 0)
      .sort((a, b) => (q ? b[1] - a[1] : 0)).map(([c]) => c);
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.innerHTML = "";
    let lastGroup = null;
    shown.forEach((c, n) => {
      if (!q && c.group !== lastGroup) {
        const h = document.createElement("li");
        h.className = "cmdk-group"; h.setAttribute("role", "presentation"); h.textContent = c.group;
        list.appendChild(h); lastGroup = c.group;
      }
      const li = document.createElement("li");
      li.id = `cmdk-opt-${n}`;
      li.className = "cmdk-item";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(n === sel));
      li.innerHTML = `<span></span><small></small>`;
      li.firstChild.textContent = c.label;
      li.lastChild.textContent = c.hint;
      li.addEventListener("mousemove", () => { if (sel !== n) { sel = n; mark(); } });
      li.addEventListener("click", () => run(n));
      list.appendChild(li);
    });
    if (!shown.length) list.innerHTML = `<li class="cmdk-empty" role="presentation">No results</li>`;
    mark();
  }
  function mark() {
    list.querySelectorAll(".cmdk-item").forEach((li, n) => li.setAttribute("aria-selected", String(n === sel)));
    const cur = list.querySelector(`#cmdk-opt-${sel}`);
    if (cur) { input.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
    else input.removeAttribute("aria-activedescendant");
  }
  function run(n) {
    const c = shown[n];
    if (!c) return;
    close();
    setTimeout(c.run, 10); // let the dialog close first so focus/scroll behave
  }
  function openPalette() {
    if (dlg.open) return;
    input.value = ""; sel = 0; render();
    dlg.showModal();
    input.focus();
  }
  function close() { if (dlg.open) dlg.close(); }

  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); mark(); }
    else if (e.key === "Enter") { e.preventDefault(); run(sel); }
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); }); // backdrop
  btn?.addEventListener("click", openPalette);
  document.addEventListener("keydown", (e) => {
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      dlg.open ? close() : openPalette();
    } else if (e.key === "/" && !dlg.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")) {
      e.preventDefault();
      openPalette();
    }
  });
})();

// Live GitHub stats on project cards (cached for the session)
(() => {
  const slots = document.querySelectorAll(".gh[data-repo]");
  if (!slots.length) return;
  const ago = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    for (const [u, sec] of units) if (s >= sec) return rtf.format(-Math.floor(s / sec), u);
    return "just now";
  };
  slots.forEach(async (el) => {
    const repo = el.dataset.repo;
    const key = `gh:${repo}`;
    let data = null;
    try { data = JSON.parse(sessionStorage.getItem(key)); } catch (e) {}
    if (!data) {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: { Accept: "application/vnd.github+json" } });
        if (!res.ok) return;
        const j = await res.json();
        data = { stars: j.stargazers_count, pushed: j.pushed_at, lang: j.language };
        try { sessionStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
      } catch (e) { return; }
    }
    el.innerHTML = (data.stars > 0 ? `<span class="star" title="GitHub stars">★ <b></b></span>` : "") + `<span class="upd"></span>`;
    if (data.stars > 0) el.querySelector("b").textContent = data.stars;
    el.querySelector(".upd").textContent = `updated ${ago(data.pushed)}`;
    el.querySelector(".upd").title = new Date(data.pushed).toLocaleString();
    el.classList.add("ready");
  });
})();

// Cursor spotlight on app/project rows
if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".app").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

// Active nav link follows the section in view (home page)
(() => {
  const links = [...document.querySelectorAll('nav a[href^="#"]')];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const visible = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
    let best = null, bestRatio = 0;
    for (const [id, ratio] of visible) if (ratio > bestRatio) { best = id; bestRatio = ratio; }
    links.forEach((a) => a.classList.toggle("active", a === byId.get(best)));
  }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

// Reading progress (resume page)
(() => {
  if (!document.querySelector("main.resume")) return;
  const bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  document.querySelector("header").appendChild(bar);
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener("resize", update);
  update();
})();

const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
