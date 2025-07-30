// Scroll animations using GSAP
window.addEventListener("DOMContentLoaded", () => {
  gsap.utils.toArray(".fade-in").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      duration: 1,
      scrollTrigger: {
        trigger: el,
        start: "top 80%"
      }
    });
  });

  gsap.utils.toArray(".fade-up").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%"
      }
    });
  });

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }
});

