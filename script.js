const RSVP_EMAIL = "your-email@example.com";
const calendarButton = document.querySelector("#saveDateButton");

document.body.classList.add("has-motion");

const hero = document.querySelector(".hero");
const heroContent = document.querySelector(".hero__content");
const revealItems = document.querySelectorAll(".reveal");
const dynamicItems = document.querySelectorAll(".scroll-dynamic");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const form = document.querySelector("#rsvpForm");
const statusMessage = document.querySelector("#formStatus");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateScrollEffects = () => {
  if (prefersReducedMotion.matches) {
    return;
  }

  const scrollY = window.scrollY;
  const heroProgress = clamp(scrollY / window.innerHeight, 0, 1);

  hero.style.setProperty("--hero-y", `${50 + heroProgress * 16}%`);
  heroContent.style.setProperty("--hero-text-y", `${heroProgress * 72}px`);
  heroContent.style.setProperty("--hero-text-opacity", `${1 - heroProgress * 0.72}`);

  dynamicItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const itemCenter = rect.top + rect.height / 2;
    const distance = clamp((itemCenter - viewportCenter) / viewportCenter, -1.35, 1.35);
    const focus = 1 - clamp(Math.abs(distance), 0, 1);

    item.style.setProperty("--scroll-shift", `${distance * -18}px`);
    item.style.setProperty("--scroll-scale", `${0.985 + focus * 0.015}`);
    item.style.setProperty("--scroll-opacity", `${0.82 + focus * 0.18}`);
  });
};

let ticking = false;

const requestScrollUpdate = () => {
  if (ticking) {
    return;
  }

  ticking = true;
  requestAnimationFrame(() => {
    updateScrollEffects();
    ticking = false;
  });
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollEffects();

if (calendarButton) {
  const calendarEvent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fayaz Shireen Wedding//Nikkah Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:fayaz-shireen-nikkah-20261220@wedding-rsvp.local",
    "DTSTAMP:20260704T000000Z",
    "DTSTART;TZID=Asia/Singapore:20261220T120000",
    "DTEND;TZID=Asia/Singapore:20261220T153000",
    "SUMMARY:The Nikkah of Fayaz & Shireen",
    "LOCATION:HomeTeamNS Khatib, 2 Yishun Walk, Singapore 767944",
    "DESCRIPTION:Wedding ceremony of Mohamed Fayaz and Shireen Shafikah.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const calendarFile = new Blob([calendarEvent], { type: "text/calendar;charset=utf-8" });
  calendarButton.href = URL.createObjectURL(calendarFile);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const name = data.get("name").trim();
  const attendance = data.get("attendance");
  const guests = data.get("guests");
  const notes = data.get("notes").trim() || "No meal notes";

  const subject = `Wedding RSVP from ${name}`;
  const body = [
    `Name: ${name}`,
    `Attendance: ${attendance}`,
    `Guests: ${guests}`,
    `Meal notes: ${notes}`,
  ].join("\n");

  localStorage.setItem(
    "wedding-rsvp",
    JSON.stringify({ name, attendance, guests, notes, sentAt: new Date().toISOString() }),
  );

  statusMessage.textContent = "Thank you. Your email app will open with your RSVP ready to send.";
  window.location.href = `mailto:${RSVP_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
