/* Bilal Ansari · site script. Vanilla JS, no dependencies.
   Sections: core utils → theme → reveals → header/nav → phone + chapters →
   marquee → pointer effects → timeline → palette → misc. */
(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const media = (q) => window.matchMedia(q);
  const reduceMotion = media("(prefers-reduced-motion: reduce)").matches;
  const finePointer = media("(hover: hover) and (pointer: fine)").matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const EMAIL = "m.bilal8492@gmail.com";

  /* ------------------------------------------------------------------ */
  /* Frame loop: each callback runs every frame until it returns false.  */
  /* ------------------------------------------------------------------ */
  const loops = new Set();
  let rafId = 0;
  let lastT = 0;
  function frame(t) {
    const dt = lastT ? Math.min(t - lastT, 48) : 16.7;
    lastT = t;
    for (const fn of loops) if (!fn(dt)) loops.delete(fn);
    if (loops.size) rafId = requestAnimationFrame(frame);
    else { rafId = 0; lastT = 0; }
  }
  const loop = (fn) => { loops.add(fn); if (!rafId) rafId = requestAnimationFrame(frame); };

  /* Damped spring, frame-rate independent. step() returns true while moving. */
  function spring(initial = 0, stiffness = 0.1, damping = 0.78) {
    let x = initial, v = 0, target = initial;
    return {
      get value() { return x; },
      set(t) { target = t; },
      snap(t) { x = target = t; v = 0; },
      step(dt) {
        const f = dt / 16.667;
        v += (target - x) * stiffness * f;
        v *= Math.pow(damping, f);
        x += v * f;
        if (Math.abs(v) < 1e-4 && Math.abs(target - x) < 1e-4) { x = target; v = 0; return false; }
        return true;
      },
    };
  }

  /* Scroll pipeline: one rAF per scroll burst; handlers get (scrollY, viewportH). */
  const scrollFns = [];
  let scrollQueued = false;
  const onScroll = (fn) => scrollFns.push(fn);
  function runScroll() {
    scrollQueued = false;
    const y = window.scrollY, vh = window.innerHeight;
    for (const fn of scrollFns) fn(y, vh);
  }
  const queueScroll = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(runScroll); } };
  addEventListener("scroll", queueScroll, { passive: true });
  addEventListener("resize", queueScroll);

  /* Intro starts once fonts are in (or after a short cap) so split lines don't reflow mid-animation. */
  Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 650)),
  ]).then(() => requestAnimationFrame(() => root.classList.add("ready")));
  const enableSmooth = () => setTimeout(() => root.classList.add("smooth-scroll"), 150);
  if (document.readyState === "complete") enableSmooth();
  else addEventListener("load", enableSmooth, { once: true });

  /* ------------------------------------------------------------------ */
  /* Theme                                                               */
  /* ------------------------------------------------------------------ */
  const themeBtn = $("#theme");
  const themeMetas = $$('meta[name="theme-color"]');
  const isDark = () => {
    const t = root.getAttribute("data-theme");
    return t ? t === "dark" : media("(prefers-color-scheme: dark)").matches;
  };
  function paintTheme() {
    const dark = isDark();
    if (themeBtn) {
      themeBtn.dataset.dark = String(dark);
      themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    if (root.hasAttribute("data-theme")) themeMetas.forEach((m) => m.setAttribute("content", dark ? "#09090b" : "#f5f4f0"));
  }
  paintTheme();
  media("(prefers-color-scheme: dark)").addEventListener?.("change", paintTheme);

  function toggleTheme(origin) {
    const apply = () => {
      const next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      paintTheme();
    };
    if (!document.startViewTransition || reduceMotion) return apply();
    // Circle that spreads out from wherever the action came from
    const r = (origin || themeBtn).getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("vt-theme");
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(() => {}); // skipped transitions (e.g. background tab) still apply the theme
    vt.finished.catch(() => {}).finally(() => root.classList.remove("vt-theme"));
  }
  themeBtn?.addEventListener("click", () => toggleTheme(themeBtn));

  /* ------------------------------------------------------------------ */
  /* Toast + clipboard                                                   */
  /* ------------------------------------------------------------------ */
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
  async function copyEmail() { await copyText(EMAIL); toast("Email copied to clipboard"); }
  $$("[data-copy]").forEach((b) =>
    b.addEventListener("click", async () => {
      await copyText(b.dataset.copy);
      toast(b.dataset.copy.includes("@") ? "Email copied to clipboard" : "Copied");
    })
  );

  /* ------------------------------------------------------------------ */
  /* Text splitting                                                      */
  /* ------------------------------------------------------------------ */
  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    let i = 0;
    const out = document.createDocumentFragment();
    const make = (node) => {
      const w = document.createElement("span");
      w.className = "w";
      w.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.className = "wi";
      inner.style.setProperty("--i", i++);
      inner.append(node);
      w.append(inner);
      return w;
    };
    const push = (text, wrapper) => {
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { out.append(" "); return; }
        let node = document.createTextNode(part);
        if (wrapper) { const c = wrapper.cloneNode(false); c.append(node); node = c; }
        out.append(make(node));
      });
    };
    Array.from(el.childNodes).forEach((n) => {
      if (n.nodeType === 3) push(n.textContent);
      else if (n.nodeType === 1) push(n.textContent, n);
    });
    el.replaceChildren(out);
  }
  $$("[data-split]").forEach(splitWords);

  $$("[data-chars]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    Array.from(text).forEach((ch, k) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", k);
      s.textContent = ch;
      el.append(s);
    });
  });

  /* Odometer digits: <span data-count>5</span> rolls from 0 through 9 to 5 */
  $$("[data-count]").forEach((el) => {
    const val = el.textContent.trim();
    el.textContent = "";
    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = val;
    const vis = document.createElement("span");
    vis.className = "odo";
    vis.setAttribute("aria-hidden", "true");
    Array.from(val).forEach((ch, k) => {
      if (!/\d/.test(ch)) { vis.append(ch); return; }
      const d = document.createElement("span");
      d.className = "odo-d";
      const s = document.createElement("span");
      s.className = "odo-s";
      s.style.setProperty("--n", ch);
      s.style.setProperty("--k", k);
      for (let n = 0; n < 20; n++) {
        const digit = document.createElement("span");
        digit.textContent = String(n % 10);
        s.append(digit);
      }
      d.append(s);
      vis.append(d);
    });
    el.append(sr, vis);
  });

  /* Frame-time bars for the performance card (deterministic) */
  $$("[data-bars]").forEach((el) => {
    const n = Number(el.dataset.bars) || 24;
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let k = 0; k < n; k++) {
      const b = document.createElement("i");
      b.style.setProperty("--h", `${Math.round(22 + rnd() * 46)}%`);
      b.style.setProperty("--k", k);
      el.append(b);
    }
  });

  $$("[data-stagger]").forEach((g) => Array.from(g.children).forEach((c, i) => c.style.setProperty("--i", i)));

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                    */
  /* ------------------------------------------------------------------ */
  const revealTargets = $$(".reveal, [data-split], [data-stagger], [data-count], .viz, .chapter-media, [data-chars]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
  }

  /* ------------------------------------------------------------------ */
  /* Header: compacts on scroll; nav pill follows hover and section      */
  /* ------------------------------------------------------------------ */
  const header = $("#header");
  onScroll((y) => header?.classList.toggle("scrolled", y > 24));

  (() => {
    const nav = $(".nav");
    if (!nav) return;
    const pill = $(".nav-pill", nav);
    const links = $$("a", nav);
    let active = links.find((a) => a.getAttribute("aria-current") === "page") || null;
    let placed = false;

    function moveTo(a) {
      if (!a || !a.offsetWidth) { pill.style.opacity = "0"; return; }
      if (!placed) { pill.classList.add("no-tr"); }
      pill.style.width = `${a.offsetWidth}px`;
      pill.style.transform = `translateX(${a.offsetLeft}px)`;
      pill.style.opacity = "1";
      if (!placed) { void pill.offsetWidth; pill.classList.remove("no-tr"); placed = true; }
    }
    links.forEach((a) => {
      a.addEventListener("pointerenter", () => moveTo(a));
      a.addEventListener("focus", () => moveTo(a));
    });
    nav.addEventListener("pointerleave", () => moveTo(active));
    nav.addEventListener("focusout", (e) => { if (!nav.contains(e.relatedTarget)) moveTo(active); });

    const targets = links.map((a) => {
      const h = a.getAttribute("href");
      return h && h.startsWith("#") ? document.getElementById(h.slice(1)) : null;
    });
    if (targets.some(Boolean)) {
      onScroll((y, vh) => {
        let cur = null;
        targets.forEach((s, k) => { if (s && s.getBoundingClientRect().top < vh * 0.45) cur = links[k]; });
        if (cur === active) return;
        active = cur;
        links.forEach((a) => a.classList.toggle("active", a === cur));
        if (!nav.matches(":hover")) moveTo(active);
      });
    }
    addEventListener("resize", () => moveTo(active));
    document.fonts?.ready.then(() => moveTo(active));
    moveTo(active);
  })();

  /* Mobile menu */
  (() => {
    const btn = $("#menu-btn"), panel = $("#mnav");
    if (!btn || !panel) return;
    const outside = $$("main, footer");
    function setMenu(open) {
      root.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      outside.forEach((el) => { el.inert = open; });
      if (open) setTimeout(() => $("a", panel)?.focus({ preventScroll: true }), 300);
    }
    btn.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
    $$("a", panel).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("menu-open")) { setMenu(false); btn.focus(); }
    });
    media("(min-width: 881px)").addEventListener?.("change", (e) => { if (e.matches) setMenu(false); });
  })();

  /* ------------------------------------------------------------------ */
  /* Phone showcase + work chapters                                      */
  /* Hero: auto-cycles. Work (desktop): follows the chapter in view.     */
  /* ------------------------------------------------------------------ */
  (() => {
    const stage = $(".stage"), device = $("#device"), d3 = $("#device3d"), phone = $("#phone");
    if (!stage || !device || !d3 || !phone) return;
    const screens = $$(".screen", phone);
    const N = screens.length;
    const dots = $("#dots"), cap = $("#cap");
    const island = $(".island", phone), islandName = $(".island-name", phone);
    const hero = $(".hero"), work = $("#apps");
    const chapters = $$(".chapter");
    const wide = media("(min-width: 1024px)");
    const DUR = 4200;
    let i = 0, timer = 0, hovering = false, inView = true, mode = "auto", cleanupT = 0, islandT = 0;

    // Real screenshots: <div class="screen" data-shot="screens/x.webp">
    screens.forEach((s) => {
      if (!s.dataset.shot) return;
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.onload = () => s.appendChild(img);
      img.src = s.dataset.shot;
    });

    // Small/medium screens: each chapter gets its own framed screen
    chapters.forEach((ch) => {
      const slot = $(".chapter-media", ch);
      const src = screens.find((s) => s.dataset.app === ch.dataset.app);
      if (!slot || !src) return;
      const mini = document.createElement("div");
      mini.className = "phone";
      const isl = document.createElement("div");
      isl.className = "island";
      const sc = document.createElement("div");
      sc.className = "screens";
      const clone = src.cloneNode(true);
      clone.className = "screen active static";
      sc.append(clone);
      mini.append(isl, sc);
      slot.append(mini);
    });

    const buttons = screens.map((s, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Show ${s.dataset.name}`);
      b.addEventListener("click", () => {
        if (mode === "scroll" && chapters[n]) {
          chapters[n].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        } else { show(n); restart(); }
      });
      dots.append(b);
      return b;
    });
    dots.style.setProperty("--dur", `${DUR}ms`);

    function setMeta(s, quiet) {
      stage.style.setProperty("--app", s.style.getPropertyValue("--c"));
      buttons.forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
      chapters.forEach((c, k) => c.classList.toggle("is-active", k === i));
      cap.querySelector("b").textContent = s.dataset.name;
      cap.querySelector("span").textContent = s.dataset.kind;
      cap.href = `#app-${s.dataset.app}`;
      if (!quiet && !reduceMotion) {
        cap.animate(
          [{ opacity: 0, transform: "translateY(8px)", filter: "blur(4px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
          { duration: 550, easing: "cubic-bezier(.16,1,.3,1)" }
        );
      }
    }

    function pulseIsland(s) {
      if (reduceMotion || !island) return;
      islandName.textContent = s.dataset.name;
      island.style.setProperty("--ic", s.style.getPropertyValue("--c"));
      island.classList.add("live");
      clearTimeout(islandT);
      islandT = setTimeout(() => island.classList.remove("live"), 1700);
    }

    // iOS-style push (forward) / pop (back) between screens
    function show(n, dir) {
      n = ((n % N) + N) % N;
      if (n === i) return;
      const prev = screens[i], next = screens[n];
      const fwd = dir ? dir > 0 : n > i;
      clearTimeout(cleanupT);
      if (reduceMotion) {
        prev.classList.remove("active");
        next.classList.add("active");
      } else {
        screens.forEach((s) => { s.style.zIndex = ""; });
        next.classList.add("no-tr");
        next.classList.remove("at-left", "at-right", "active");
        next.classList.add(fwd ? "at-right" : "at-left");
        next.style.zIndex = fwd ? "3" : "2";
        prev.style.zIndex = fwd ? "2" : "3";
        void next.offsetWidth;
        next.classList.remove("no-tr", "at-right", "at-left");
        next.classList.add("active");
        prev.classList.remove("active");
        prev.classList.add(fwd ? "at-left" : "at-right");
        cleanupT = setTimeout(() => {
          screens.forEach((s) => {
            if (s === screens[i]) return;
            s.classList.add("no-tr");
            s.classList.remove("at-left", "at-right");
            s.style.zIndex = "";
            void s.offsetWidth;
            s.classList.remove("no-tr");
          });
        }, 760);
      }
      i = n;
      setMeta(next);
      pulseIsland(next);
      if (dots.classList.contains("playing")) {
        dots.classList.remove("playing");
        void dots.offsetWidth;
        dots.classList.add("playing");
      }
    }

    function stop() { clearInterval(timer); timer = 0; dots.classList.remove("playing"); }
    function restart() {
      stop();
      if (reduceMotion || mode !== "auto" || hovering || !inView || document.hidden) return;
      void dots.offsetWidth;
      dots.classList.add("playing");
      timer = setInterval(() => show(i + 1, 1), DUR);
    }
    function setMode(m) {
      if (m === mode) return;
      mode = m;
      stage.dataset.mode = m;
      restart();
    }

    screens[0].classList.add("active");
    setMeta(screens[0], true);
    restart();
    setTimeout(() => { if (mode === "auto") pulseIsland(screens[i]); }, 1900);

    device.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovering = true; restart(); } });
    device.addEventListener("pointerleave", () => { hovering = false; restart(); });
    document.addEventListener("visibilitychange", restart);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; restart(); }).observe(phone);
    }

    // Swipe on touch
    let x0 = null;
    phone.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    phone.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 30) { const d = dx < 0 ? 1 : -1; show(i + d, d); restart(); }
    });

    // 3D pose: hero tilt eases to front-facing as you scroll into the work; pointer adds a spring tilt.
    // (Skipped under reduced motion; the chapter sync below still runs, with instant screen swaps.)
    const tx = spring(0, 0.07, 0.82), ty = spring(0, 0.07, 0.82), sp = spring(0, 0.09, 0.8);
    function render(dt) {
      const a = tx.step(dt), b = ty.step(dt), c = sp.step(dt);
      const P = sp.value;
      const rotY = lerp(-14, -3, P) + tx.value * lerp(16, 7, P);
      const rotX = lerp(6, 1, P) - ty.value * lerp(10, 5, P);
      d3.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) translateZ(${(P * 24).toFixed(1)}px)`;
      device.style.setProperty("--chips", (1 - clamp(P * 1.6)).toFixed(3));
      return a || b || c;
    }

    let heroH = hero.offsetHeight;
    addEventListener("resize", () => { heroH = hero.offsetHeight; });
    onScroll((y, vh) => {
      if (!wide.matches) {
        setMode("auto");
        if (!reduceMotion && sp.value !== 0) { sp.snap(0); render(16.7); }
        hero.style.removeProperty("--hp");
        return;
      }
      if (!reduceMotion) {
        sp.set(clamp(y / (heroH * 0.7)));
        loop(render);
        hero.style.setProperty("--hp", clamp(y / heroH).toFixed(3));
      }

      const wr = work.getBoundingClientRect();
      if (wr.top > vh * 0.55 || wr.bottom < vh * 0.35) { setMode("auto"); return; }
      setMode("scroll");
      let best = 0, bestD = Infinity;
      chapters.forEach((c, n) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestD) { bestD = d; best = n; }
      });
      show(best);
    });

    if (finePointer && !reduceMotion) {
      stage.addEventListener("pointermove", (e) => {
        const r = device.getBoundingClientRect();
        tx.set(clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth * 0.5), -1, 1));
        ty.set(clamp((e.clientY - (r.top + r.height * 0.45)) / (innerHeight * 0.5), -1, 1));
        loop(render);
      }, { passive: true });
      stage.addEventListener("pointerleave", () => { tx.set(0); ty.set(0); loop(render); });
    }
  })();

  /* ------------------------------------------------------------------ */
  /* Marquee: drifts, speeds up and leans with scroll velocity           */
  /* ------------------------------------------------------------------ */
  (() => {
    const el = $(".marquee");
    if (!el || reduceMotion) return;
    const track = $(".marquee-track", el);
    const group = track.firstElementChild;
    let w = 0, x = 0, vel = 0, dir = 1, lastY = scrollY, visible = false;
    const skew = spring(0, 0.12, 0.75);
    const measure = () => { w = group.getBoundingClientRect().width; };
    measure();
    addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    onScroll((y) => {
      const d = y - lastY;
      lastY = y;
      if (!d) return;
      dir = d > 0 ? 1 : -1;
      vel = clamp(vel + d * 0.12, -36, 36);
    });
    function tick(dt) {
      const f = dt / 16.667;
      x -= (0.7 * dir + vel) * f;
      vel *= Math.pow(0.9, f);
      if (w) { while (x <= -w) x += w; while (x > 0) x -= w; }
      skew.set(clamp(vel * 0.35, -9, 9));
      skew.step(dt);
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${(-skew.value).toFixed(2)}deg)`;
      return visible;
    }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(tick); }).observe(el);
  })();

  /* ------------------------------------------------------------------ */
  /* Pointer effects (fine pointers only)                                */
  /* ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    // Magnetic buttons
    $$("[data-magnetic]").forEach((el) => {
      const sx = spring(0, 0.14, 0.72), sy = spring(0, 0.14, 0.72);
      const tick = (dt) => {
        const a = sx.step(dt), b = sy.step(dt);
        el.style.transform = `translate3d(${sx.value.toFixed(2)}px, ${sy.value.toFixed(2)}px, 0)`;
        return a || b;
      };
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left - sx.value + r.width / 2, cy = r.top - sy.value + r.height / 2;
        sx.set((e.clientX - cx) * 0.3);
        sy.set((e.clientY - cy) * 0.42);
        loop(tick);
      });
      el.addEventListener("pointerleave", () => { sx.set(0); sy.set(0); loop(tick); });
    });

    // 3D tilt + glare on project cards
    $$("[data-tilt]").forEach((card) => {
      const sx = spring(0, 0.09, 0.78), sy = spring(0, 0.09, 0.78);
      const tick = (dt) => {
        const a = sx.step(dt), b = sy.step(dt);
        card.style.transform = `rotateX(${(-sy.value * 5).toFixed(2)}deg) rotateY(${(sx.value * 6).toFixed(2)}deg)`;
        return a || b;
      };
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        sx.set(nx * 2 - 1);
        sy.set(ny * 2 - 1);
        card.style.setProperty("--gx", `${(nx * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${(ny * 100).toFixed(1)}%`);
        loop(tick);
      });
      card.addEventListener("pointerleave", () => { sx.set(0); sy.set(0); loop(tick); });
    });

    // Soft glows that trail the pointer
    const follow = (area, target, x0, y0) => {
      if (!area || !target) return;
      const gx = spring(x0, 0.05, 0.8), gy = spring(y0, 0.05, 0.8);
      const tick = (dt) => {
        const a = gx.step(dt), b = gy.step(dt);
        target.style.setProperty("--gx", `${gx.value.toFixed(2)}%`);
        target.style.setProperty("--gy", `${gy.value.toFixed(2)}%`);
        return a || b;
      };
      area.addEventListener("pointermove", (e) => {
        const r = target.parentElement.getBoundingClientRect();
        gx.set(((e.clientX - r.left) / r.width) * 100);
        gy.set(((e.clientY - r.top) / r.height) * 100);
        loop(tick);
      }, { passive: true });
    };
    follow($(".stage"), $(".backdrop-glow"), 28, 26);
    follow($(".contact"), $(".contact-glow"), 50, 62);
  }

  // Border spotlight across the bento grid (cheap; also fine on reduced motion)
  if (finePointer) {
    $$("[data-spot]").forEach((group) => {
      const cards = $$(".card", group);
      group.addEventListener("pointermove", (e) => {
        for (const c of cards) {
          const r = c.getBoundingClientRect();
          c.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
          c.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
        }
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Experience timeline draws as you read                               */
  /* ------------------------------------------------------------------ */
  (() => {
    const tl = $("#timeline");
    if (!tl) return;
    const items = $$(".tl-item", tl);
    onScroll((y, vh) => {
      const r = tl.getBoundingClientRect();
      const line = vh * 0.62;
      tl.style.setProperty("--p", clamp((line - r.top) / r.height).toFixed(4));
      items.forEach((it) => it.classList.toggle("lit", it.getBoundingClientRect().top + 12 < line));
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Command palette (Ctrl/⌘ K, or /)                                    */
  /* ------------------------------------------------------------------ */
  (() => {
    const onHome = !!document.getElementById("apps");
    const go = (hash) => () => {
      if (onHome) document.querySelector(hash)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      else location.href = `/${hash}`;
    };
    const open = (url, blank) => () => (blank ? window.open(url, "_blank", "noopener") : (location.href = url));
    const download = (href) => () => {
      const a = Object.assign(document.createElement("a"), { href, download: "" });
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    const commands = [
      { group: "Navigate", label: "Work", hint: "Apps in production", run: go("#apps") },
      { group: "Navigate", label: "Experience", hint: "Section", run: go("#experience") },
      { group: "Navigate", label: "Skills", hint: "Section", run: go("#skills") },
      { group: "Navigate", label: "Open source projects", hint: "Section", run: go("#projects") },
      { group: "Navigate", label: "Contact", hint: "Section", run: go("#contact") },
      { group: "Navigate", label: "Resume", hint: "Page", run: open("/resume.html") },
      { group: "Actions", label: "Copy email address", hint: EMAIL, run: copyEmail },
      { group: "Actions", label: "Download resume (PDF)", hint: "PDF", run: download("/bilal_ansari_resume.pdf") },
      { group: "Actions", label: "Save contact card", hint: "vCard", run: download("/bilal-ansari.vcf") },
      { group: "Actions", label: "Toggle light / dark theme", hint: "Theme", run: () => toggleTheme(document.getElementById("cmdk")) },
      { group: "Actions", label: "Send an email", hint: "Mail", run: open(`mailto:${EMAIL}`) },
      { group: "Links", label: "GitHub", hint: "github.com/bilal8492", run: open("https://github.com/bilal8492", true) },
      { group: "Links", label: "LinkedIn", hint: "in/bilal8492", run: open("https://linkedin.com/in/bilal8492", true) },
      { group: "Links", label: "ReelGuard", hint: "Project", run: open("https://bilalansari.in/ReelGuard/", true) },
      { group: "Links", label: "Updraft", hint: "Project", run: open("https://bilalansari.in/updraft/", true) },
    ];

    const btn = document.getElementById("cmdk");
    const kbd = btn?.querySelector("kbd");
    if (kbd) kbd.textContent = isMac ? "⌘K" : "Ctrl K";

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
      let k = 0; // loose subsequence match
      for (const ch of hay) if (ch === q[k]) k++;
      return k === q.length ? 0.5 : 0;
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
          h.className = "cmdk-group";
          h.setAttribute("role", "presentation");
          h.textContent = c.group;
          list.appendChild(h);
          lastGroup = c.group;
        }
        const li = document.createElement("li");
        li.id = `cmdk-opt-${n}`;
        li.className = "cmdk-item";
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", String(n === sel));
        li.innerHTML = "<span></span><small></small>";
        li.firstChild.textContent = c.label;
        li.lastChild.textContent = c.hint;
        li.addEventListener("mousemove", () => { if (sel !== n) { sel = n; mark(); } });
        li.addEventListener("click", () => run(n));
        list.appendChild(li);
      });
      if (!shown.length) list.innerHTML = '<li class="cmdk-empty" role="presentation">No results</li>';
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
      input.value = "";
      sel = 0;
      render();
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
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
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

  /* ------------------------------------------------------------------ */
  /* Live GitHub stats on project cards (cached for the session)         */
  /* ------------------------------------------------------------------ */
  (() => {
    const slots = $$(".gh[data-repo]");
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
          data = { stars: j.stargazers_count, pushed: j.pushed_at };
          try { sessionStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
        } catch (e) { return; }
      }
      el.innerHTML = (data.stars > 0 ? '<span class="star" title="GitHub stars">★ <b></b></span>' : "") + '<span class="upd"></span>';
      if (data.stars > 0) el.querySelector("b").textContent = data.stars;
      const upd = el.querySelector(".upd");
      upd.textContent = `updated ${ago(data.pushed)}`;
      upd.title = new Date(data.pushed).toLocaleString();
      el.classList.add("ready");
    });
  })();

  /* Reading progress (resume page) */
  (() => {
    if (!$("main.resume")) return;
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    onScroll((y, vh) => {
      const max = document.documentElement.scrollHeight - vh;
      bar.style.setProperty("--rp", (max > 0 ? clamp(y / max) : 0).toFixed(4));
    });
  })();

  /* Local time in Mumbai */
  const clock = $("#clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    const tickClock = () => { clock.textContent = fmt.format(new Date()); };
    tickClock();
    setInterval(tickClock, 10000);
  }

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  runScroll();
})();
