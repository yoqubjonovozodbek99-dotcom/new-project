const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");

function closeMobileMenu() {
  if (navLinks) navLinks.classList.remove("open");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

const sectionObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => sectionObserver.observe(item));

const animateCounter = (element, target) => {
  let value = 0;
  const duration = 1100;
  const stepTime = Math.max(20, Math.floor(duration / target));
  const timer = setInterval(() => {
    value += 1;
    element.textContent = value;
    if (value >= target) clearInterval(timer);
  }, stepTime);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter || "0");
      if (target > 0) animateCounter(el, target);
      observer.unobserve(el);
    });
  },
  { threshold: 0.4 }
);

counters.forEach((counter) => counterObserver.observe(counter));
