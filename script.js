const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const themeToggle = document.querySelector("#themeToggle");
const themeIcon = document.querySelector(".theme-icon");
const revealItems = document.querySelectorAll(".reveal");
const progressBars = document.querySelectorAll(".progress-fill");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light", isLight);
  themeIcon.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
    return;
  }

  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight ? "light" : "dark");
}

function closeMobileMenu() {
  navLinks.classList.remove("open");
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
    applyTheme(nextTheme);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => sectionObserver.observe(item));

const skillsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const fills = entry.target.querySelectorAll(".progress-fill");
      fills.forEach((fill) => {
        const width = fill.dataset.width || "0";
        fill.style.width = width;
      });
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.45 }
);

const skillsSection = document.querySelector("#skills");
if (skillsSection) {
  skillsObserver.observe(skillsSection);
}

function setFieldError(input, message) {
  const errorSlot = input.parentElement.querySelector(".error-text");
  input.classList.add("input-error");
  errorSlot.textContent = message;
}

function clearFieldError(input) {
  const errorSlot = input.parentElement.querySelector(".error-text");
  input.classList.remove("input-error");
  errorSlot.textContent = "";
}

function validateField(input) {
  const value = input.value.trim();

  if (!value) {
    setFieldError(input, "This field is required.");
    return false;
  }

  if (input.name === "email" && !emailPattern.test(value)) {
    setFieldError(input, "Please enter a valid email address.");
    return false;
  }

  if (input.name === "message" && value.length < 12) {
    setFieldError(input, "Message should be at least 12 characters.");
    return false;
  }

  clearFieldError(input);
  return true;
}

if (contactForm) {
  const fields = Array.from(contactForm.querySelectorAll("input, textarea"));

  fields.forEach((field) => {
    field.addEventListener("input", () => validateField(field));
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    const isFormValid = fields.map(validateField).every(Boolean);
    if (!isFormValid) {
      formStatus.textContent = "Please fix the highlighted fields.";
      formStatus.style.color = "#ff6f6f";
      return;
    }

    formStatus.textContent = "Message sent successfully. I will contact you soon.";
    formStatus.style.color = "var(--success)";
    contactForm.reset();
  });
}

initializeTheme();
