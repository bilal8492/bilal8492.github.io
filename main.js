const root = document.documentElement;
root.classList.add("js");

// Theme: follows system; toggle persists (best effort)
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
} catch (e) {}

const toggle = document.getElementById("theme");
function isDark() {
  const t = root.getAttribute("data-theme");
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}
function paint() {
  if (toggle) toggle.textContent = isDark() ? "☀" : "☾";
}
paint();
toggle?.addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
  paint();
});

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

const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
