// Add Typed.js library
const script = document.createElement("script");
script.src = "https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js";
script.async = true;

script.onload = () => {
  document.getElementById("year").textContent = new Date().getFullYear();
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

window.addEventListener("scroll", function () {
  const mouseIcon = document.querySelector(".mouse-icon");
  if (window.scrollY > 50) {
    // Adjust 50 to change when it hides
    mouseIcon.style.display = "none";
  } else {
    mouseIcon.style.display = "block";
  }
});

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
    jarc: {
      title: "Jebel Ali Racecourse",
      description:
        "Introducing the Jebel Ali Racecourse (JARC) App, the ultimate racegoer mobile app experience. Stay updated with real-time race fixtures, results, and exclusive benefits. Designed with a seamless UI, the app ensures users never miss an update. As the lead developer, I built the app from scratch, handling UI/UX, API integrations, and deployment to both iOS and Android platforms.",
      ios: "https://apps.apple.com/ae/app/jebel-ali-racecourse/id6476908300",
      android:
        "https://play.google.com/store/apps/details?id=com.jarc.app&hl=en_IN",
    },
    huna: {
      title: "HUNA Living",
      description:
        "HUNA is a premier real estate app for discovering and reserving curated residences, retail destinations, and cultural experiences. Led a team of 4 developers to build a secure, high-performance app with Salesforce authentication, Firebase push notifications, and Sentry crash monitoring. Implemented IoT device management, CodePush for seamless updates, and enhanced security with SSL Pinning and Remote Config.",

      ios: "https://apps.apple.com/ae/app/huna-living/id6463616889",
      android:
        "https://play.google.com/store/apps/details?id=com.hunaproperties.app&hl=en_IN",
    },
    drec: {
      title: "DREC eServices",
      description:
        "Exclusively for DREC tenants, this app streamlines property management with Virtual Key access, contract handling, payments, and maintenance requests. As a senior developer, I built a secure, feature-rich app integrating Salesforce for authentication, Firebase for push notifications, and Sentry for crash monitoring. Developed a custom IoT module and enhanced security with SSL Pinning and Remote Config.",
      ios: "https://apps.apple.com/ae/app/drec-eservices/id1663713914",
      android:
        "https://play.google.com/store/apps/details?id=com.drec.ae&hl=en_IN",
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
