window.addEventListener("DOMContentLoaded", () => {
  gsap.utils.toArray(".fade-in").forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: i * 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true
        }
      }
    );
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

document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.toggle-button');
  const prices = {
    bronze: { monthly: '$49', yearly: '$499' },
    silver: { monthly: '$99', yearly: '$999' },
    gold:   { monthly: '$199', yearly: '$1999' }
  };

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;

      toggleButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      document.querySelectorAll('.card').forEach(card => {
        const plan = card.dataset.plan;
        card.querySelector('.price').textContent = prices[plan][mode];
        card.querySelector('.billed').textContent = mode === 'monthly'
          ? 'Billed monthly'
          : 'Billed annually';
      });
    });
  });
});

