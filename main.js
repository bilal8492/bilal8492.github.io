// Typed headline animation
const typedScript = document.createElement("script");
typedScript.src = "https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js";
typedScript.async = true;
typedScript.onload = () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  if (typeof Typed !== "undefined") {
    new Typed(".text", {
      strings: [
        "React Native Developer",
        "Mobile App Developer",
        "Cross-Platform Expert",
      ],
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 1400,
      loop: true,
      cursorChar: "▍",
    });
  }
};
document.head.appendChild(typedScript);

// Fallback year in case the script load is delayed
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const body = document.body;
const sections = Array.from(document.querySelectorAll("section"));
const headerLinks = Array.from(document.querySelectorAll("header nav a"));
const drawer = document.getElementById("drawer");
const drawerLinks = Array.from(drawer?.querySelectorAll("a") ?? []);
const allNavAnchors = [...headerLinks, ...drawerLinks];
const mouseIcon = document.querySelector(".mouse-icon");
const themeButtons = [
  document.getElementById("themeToggle"),
  document.getElementById("drawerThemeToggle"),
].filter(Boolean);
const hamburger = document.getElementById("menuIcon");
const closeIcon = drawer?.querySelector(".close-icon");

drawer?.setAttribute("aria-hidden", "true");

function updateThemeButtons(theme) {
  themeButtons.forEach((button) => {
    const icon = button.querySelector("i");
    const label = button.querySelector(".theme-toggle__label");
    const isDark = theme === "dark";

    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    if (icon) {
      icon.classList.toggle("fa-moon", !isDark);
      icon.classList.toggle("fa-sun", isDark);
    }

    if (label) {
      label.textContent = isDark ? "Light" : "Dark";
    }
  });
}

function applyTheme(theme) {
  body.dataset.theme = theme;
  updateThemeButtons(theme);
}

const themePreference = window.matchMedia("(prefers-color-scheme: dark)");
let storedTheme = localStorage.getItem("theme");
let currentTheme = storedTheme || (themePreference.matches ? "dark" : "light");
applyTheme(currentTheme);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", currentTheme);
    storedTheme = currentTheme;
    applyTheme(currentTheme);
    if (drawer?.classList.contains("open")) {
      toggleDrawer(false);
    }
  });
});

themePreference.addEventListener("change", (event) => {
  if (localStorage.getItem("theme")) return;
  currentTheme = event.matches ? "dark" : "light";
  applyTheme(currentTheme);
});

function toggleDrawer(force) {
  if (!drawer) return;
  const shouldOpen =
    typeof force === "boolean" ? force : !drawer.classList.contains("open");
  drawer.classList.toggle("open", shouldOpen);
  drawer.setAttribute("aria-hidden", String(!shouldOpen));
  body.classList.toggle("drawer-open", shouldOpen);
}

hamburger?.addEventListener("click", () => toggleDrawer());
closeIcon?.addEventListener("click", () => toggleDrawer(false));

drawerLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId) {
      setActiveNav(targetId);
    }
    toggleDrawer(false);
  });
});

function setActiveNav(id) {
  allNavAnchors.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    link.classList.toggle("active", href === `#${id}`);
  });
}

function highlightOnScroll() {
  const scrollPosition = window.scrollY + 220;
  let activeId = sections[0]?.id;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      activeId = section.id;
    }
  });

  if (activeId) {
    setActiveNav(activeId);
  }
}

window.addEventListener("scroll", highlightOnScroll, { passive: true });
highlightOnScroll();

if (mouseIcon) {
  const updateMouseIcon = () => {
    mouseIcon.style.opacity = window.scrollY > 60 ? "0" : "1";
  };
  window.addEventListener("scroll", updateMouseIcon, { passive: true });
  updateMouseIcon();
}

const projectData = {
  jarc: {
    title: "Jebel Ali Racecourse",
    description:
      "Introducing the Jebel Ali Racecourse (JARC) App, the ultimate racegoer mobile app experience. Stay updated with real-time race fixtures, results, and exclusive benefits. Designed with a seamless UI, the app ensures users never miss an update. As the lead developer, I built the app from scratch, handling UI/UX, API integrations, and deployment to both iOS and Android platforms.",
    ios: "https://apps.apple.com/ae/app/jebel-ali-racecourse/id6476908300",
    android: "https://play.google.com/store/apps/details?id=com.jarc.app&hl=en_IN",
  },
  huna: {
    title: "HUNA Living",
    description:
      "HUNA is a premier real estate app for discovering and reserving curated residences, retail destinations, and cultural experiences. Led a team of 4 developers to build a secure, high-performance app with Salesforce authentication, Firebase push notifications, and Sentry crash monitoring. Implemented IoT device management, CodePush for seamless updates, and enhanced security with SSL Pinning and Remote Config.",
    ios: "https://apps.apple.com/ae/app/huna-living/id6463616889",
    android: "https://play.google.com/store/apps/details?id=com.hunaproperties.app&hl=en_IN",
  },
  drec: {
    title: "DREC eServices",
    description:
      "Exclusively for DREC tenants, this app streamlines property management with Virtual Key access, contract handling, payments, and maintenance requests. As a senior developer, I built a secure, feature-rich app integrating Salesforce for authentication, Firebase for push notifications, and Sentry for crash monitoring. Developed a custom IoT module and enhanced security with SSL Pinning and Remote Config.",
    ios: "https://apps.apple.com/ae/app/drec-eservices/id1663713914",
    android: "https://play.google.com/store/apps/details?id=com.drec.ae&hl=en_IN",
  },
};

const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const iosLink = document.getElementById("ios-link");
const androidLink = document.getElementById("android-link");
const closeModalBtn = document.querySelector(".close");

function openModal(project) {
  if (!modal || !projectData[project]) return;
  const { title, description, ios, android } = projectData[project];
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  iosLink.href = ios;
  androidLink.href = android;

  modal.style.display = "flex";
  requestAnimationFrame(() => modal.classList.add("show"));
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
  setTimeout(() => {
    if (!modal.classList.contains("show")) {
      modal.style.display = "none";
    }
  }, 280);
}

closeModalBtn?.addEventListener("click", closeModal);

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    toggleDrawer(false);
  }
});

window.openModal = openModal;
window.closeModal = closeModal;
