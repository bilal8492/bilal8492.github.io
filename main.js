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

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const iosLink = document.getElementById("ios-link");
  const androidLink = document.getElementById("android-link");
  const closeModalBtn = document.querySelector(".close");

  // Ensure modal is hidden on page load
  modal.style.display = "none";

  const projectData = {
    ecommerce: {
      title: "E-commerce App",
      description:
        "A modern e-commerce platform with secure payments and a smooth shopping experience.",
      ios: "https://apps.apple.com/ecommerce-app",
      android: "https://play.google.com/ecommerce-app",
    },
    portfolio: {
      title: "Portfolio App",
      description:
        "A personal portfolio showcasing my skills, projects, and achievements.",
      ios: "https://apps.apple.com/portfolio-app",
      android: "https://play.google.com/portfolio-app",
    },
    "task-manager": {
      title: "Task Manager App",
      description:
        "An efficient task management app with real-time collaboration features.",
      ios: "https://apps.apple.com/task-manager-app",
      android: "https://play.google.com/task-manager-app",
    },
  };

  window.openModal = function (project) {
    if (projectData[project]) {
      modalTitle.textContent = projectData[project].title;
      modalDescription.textContent = projectData[project].description;
      iosLink.href = projectData[project].ios;
      androidLink.href = projectData[project].android;

      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show"), 10); // Ensures transition works
    }
  };

  window.closeModal = function () {
    modal.classList.remove("show");
    setTimeout(() => {
      if (!modal.classList.contains("show")) {
        modal.style.display = "none";
      }
    }, 300);
  };

  closeModalBtn.addEventListener("click", window.closeModal);

  window.addEventListener("click", (event) => {
    const modalContent = document.querySelector(".modal-content");
    if (event.target === modal) {
      window.closeModal();
    } else if (modal.contains(event.target) && event.target !== modalContent) {
      // Prevent closing if clicking inside the modal
      event.stopPropagation();
    }
  });
});
