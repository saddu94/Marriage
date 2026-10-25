(function () {
  "use strict";
  const data = window.INVITATION || {};
  const byId = (id) => document.getElementById(id);
  const clean = (value, fallback) => String(value || fallback || "");
  const firstInitial = (value) => (String(value || "").trim().match(/[A-Za-z0-9]/) || ["Y"])[0].toUpperCase();
  const monogram = firstInitial(data.partnerOne) + " & " + firstInitial(data.partnerTwo);
  const bindings = {
    partnerOne: clean(data.partnerOne, "Your name"),
    partnerTwo: clean(data.partnerTwo, "Your partner's name"),
    dateLabel: clean(data.dateLabel, "Your wedding date"),
    city: clean(data.city, "Your city"),
    venue: clean(data.venue, "Your venue"),
    address: clean(data.address, "Street address, city"),
    storyTitle: clean(data.storyTitle, "A little about us"),
    story: clean(data.story, "Add your story in content.js."),
    eventDate: clean(data.eventDate, "Sunday, 10 January 2027"),
    eventTime: clean(data.eventTime, "11:30 AM – 12:00 PM"),
    eventVenue: clean(data.eventVenue, "Valliyapalli Community Hall"),
    monogram: monogram,
    dateShort: clean(data.dateShort, "10 JANUARY 2027")
  };

  document.querySelectorAll("[data-bind]").forEach(function (node) {
    const key = node.getAttribute("data-bind");
    if (Object.prototype.hasOwnProperty.call(bindings, key)) node.textContent = bindings[key];
  });
  document.title = bindings.partnerOne + " & " + bindings.partnerTwo + " — Wedding Invitation";

  let toastTimer;
  function showToast(message) {
    const toast = byId("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 3600);
  }

  function updateCountdown() {
    const dateValue = String(data.weddingDateISO || "").trim();
    const target = new Date(dateValue);
    const note = byId("countdown-note");
    if (!dateValue || Number.isNaN(target.getTime())) {
      if (note) note.textContent = "Add your wedding date in content.js to start the countdown.";
      return;
    }
    const delta = target.getTime() - Date.now();
    if (delta <= 0) {
      if (note) note.textContent = "Today is the day. Let the celebrating begin!";
      ["days", "hours", "minutes", "seconds"].forEach(function (id) { byId(id).textContent = "00"; });
      return;
    }
    const days = Math.floor(delta / 86400000);
    const hours = Math.floor((delta % 86400000) / 3600000);
    const minutes = Math.floor((delta % 3600000) / 60000);
    const seconds = Math.floor((delta % 60000) / 1000);
    byId("days").textContent = String(days).padStart(2, "0");
    byId("hours").textContent = String(hours).padStart(2, "0");
    byId("minutes").textContent = String(minutes).padStart(2, "0");
    byId("seconds").textContent = String(seconds).padStart(2, "0");
    if (note) note.textContent = "The days are getting closer. We can’t wait to see you.";
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  function icsDate(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  function icsEscape(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }
  byId("save-date").addEventListener("click", function () {
    const dateValue = String(data.weddingDateISO || "").trim();
    const start = new Date(dateValue);
    if (!dateValue || Number.isNaN(start.getTime())) {
      showToast("Add your wedding date and time in content.js to create a calendar invite.");
      return;
    }
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const title = "Wedding — " + bindings.partnerOne + " & " + bindings.partnerTwo;
    const place = bindings.venue + ", " + bindings.address;
    const calendar = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN",
      "BEGIN:VEVENT", "UID:wedding-" + start.getTime() + "@invitation.local",
      "DTSTAMP:" + icsDate(new Date()), "DTSTART:" + icsDate(start), "DTEND:" + icsDate(end),
      "SUMMARY:" + icsEscape(title), "LOCATION:" + icsEscape(place),
      "DESCRIPTION:" + icsEscape("We would love to celebrate with you!"),
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-invitation.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Your calendar invite is ready.");
  });

  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js-ready");
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".story, .details, .location, .coming-soon-section").forEach(function (section) {
      observer.observe(section);
    });
  }
})();









