// Add Typed.js library
const script = document.createElement("script");
script.src = "https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js";
script.async = true;

script.onload = () => {
  // Initialize Typed.js after the library is loaded
  const typed = new Typed(".text", {
    strings: [
      "React Native Developer",
      "Mobile App Developer",
      "Cross-Platform Expert",
    ],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true,
  });
};
document.head.appendChild(script);

// Scroll sections
let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll("header nav a");

window.onscroll = () => {
  sections.forEach((sec) => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute("id");

    if (top >= offset && top < offset + height) {
      navLinks.forEach((links) => {
        links.classList.remove("active");
        document
          .querySelector("header nav a[href*=" + id + "]")
          .classList.add("active");
      });
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const drawer = document.querySelector(".drawer");
  const navLinksContainer = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinksContainer.classList.toggle("active");
      toggleDrawer();
    });
  } else {
    console.error("Hamburger element not found");
  }

  if (drawer) {
    drawer.addEventListener("click", () => {
      toggleDrawer();
    });
  }

  function toggleDrawer() {
    const drawer = document.getElementById("drawer");
    drawer.classList.toggle("open");
  }

  const drawerItems = document.querySelectorAll(".drawer a");
  drawerItems.forEach((item) => {
    item.addEventListener("click", () => {
      drawerItems.forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
    });
  });
});
