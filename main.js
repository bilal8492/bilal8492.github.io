import './style.css'

// Typing animation
const typed = new Typed('.text', {
  strings: ['React Native Developer', 'Mobile App Developer', 'Cross-Platform Expert'],
  typeSpeed: 100,
  backSpeed: 100,
  backDelay: 1000,
  loop: true
});

// Scroll sections
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
  sections.forEach(sec => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute('id');

    if (top >= offset && top < offset + height) {
      navLinks.forEach(links => {
        links.classList.remove('active');
        document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
      });
    }
  });
};

// Add Typed.js library
const script = document.createElement('script');
script.src = 'https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js';
script.async = true;
document.head.appendChild(script);