/* ============================================
   LISBOA BARBERÍA — script.js
   ============================================ */

// ---------- Año dinámico ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Navbar: fondo al scrollear ----------
const navbar = document.getElementById("navbar");

function onScroll() {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Menú mobile ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

// Cerrar menú al hacer click en un link
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  })
);

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Contador animado del hero ----------
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimal || "0", 10);
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = target * eased;

    if (target >= 1000) {
      el.textContent = Math.round(value).toLocaleString("es-AR");
    } else {
      el.textContent = value.toFixed(decimals);
    }

    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

const heroStats = document.querySelector(".hero-stats");
if (heroStats) statsObserver.observe(heroStats);

// ---------- Slider de testimonios ----------
const slides = document.querySelectorAll("#testiSlides .slide");
const dotsContainer = document.getElementById("testiDots");
let currentSlide = 0;
let slideTimer;

slides.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.setAttribute("aria-label", `Testimonio ${index + 1}`);
  if (index === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToSlide(index));
  dotsContainer.appendChild(dot);
});

const dots = dotsContainer.querySelectorAll("button");

function goToSlide(index) {
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");
  currentSlide = index;
  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function nextSlide() {
  goToSlide((currentSlide + 1) % slides.length);
}

function startAutoplay() {
  slideTimer = setInterval(nextSlide, 5000);
}

startAutoplay();

// Pausar autoplay cuando el usuario interactúa con los dots
dotsContainer.addEventListener("click", () => {
  clearInterval(slideTimer);
  startAutoplay();
});

// ---------- Formulario de reserva ----------
const bookingForm = document.getElementById("bookingForm");
const horaSelect = document.getElementById("hora");
const fechaInput = document.getElementById("fecha");

// Generar horarios de 9 a 19:30 cada 30 min
(function fillHours() {
  for (let h = 9; h < 20; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) continue;
      const label = `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
      const option = document.createElement("option");
      option.value = label;
      option.textContent = `${label} h`;
      horaSelect.appendChild(option);
    }
  }
})();

// No permitir fechas pasadas ni domingos
(function setupDate() {
  const today = new Date().toISOString().split("T")[0];
  fechaInput.min = today;
})();

function setError(inputEl, message) {
  const field = inputEl.closest(".field");
  const errorEl = field.querySelector(".error-msg");
  field.classList.toggle("invalid", Boolean(message));
  errorEl.textContent = message || "";
}

function validateField(inputEl) {
  const value = inputEl.value.trim();

  switch (inputEl.id) {
    case "nombre":
      if (!value) return "Ingresá tu nombre.";
      if (value.length < 3) return "Mínimo 3 caracteres.";
      break;
    case "telefono":
      if (!value) return "Ingresá tu teléfono.";
      if (!/^[+\d][\d\s\-()]{6,}$/.test(value)) return "Teléfono inválido.";
      break;
    case "servicio":
      if (!value) return "Elegí un servicio.";
      break;
    case "fecha": {
      if (!value) return "Elegí una fecha.";
      const day = new Date(value + "T12:00:00").getDay();
      if (day === 0) return "Los domingos estamos cerrados.";
      break;
    }
    case "hora":
      if (!value) return "Elegí un horario.";
      break;
  }
  return "";
}

// Validación en vivo
["nombre", "telefono", "servicio", "fecha", "hora"].forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener("input", () => setError(el, ""));
  el.addEventListener("blur", () => setError(el, validateField(el)));
});

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let firstInvalid = null;
  ["nombre", "telefono", "servicio", "fecha", "hora"].forEach((id) => {
    const el = document.getElementById(id);
    const msg = validateField(el);
    setError(el, msg);
    if (msg && !firstInvalid) firstInvalid = el;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // Simulación de envío
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "Enviando…";

  setTimeout(() => {
    document.getElementById("formSuccess").hidden = false;
    btn.textContent = "¡Reserva enviada!";
    bookingForm.reset();
    fechaInput.min = new Date().toISOString().split("T")[0];

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "Confirmar reserva";
      document.getElementById("formSuccess").hidden = true;
    }, 4500);
  }, 900);
});
