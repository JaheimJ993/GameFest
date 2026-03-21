(() => {
  const daysEl = document.getElementById("gf-days");
  const hoursEl = document.getElementById("gf-hours");
  const minutesEl = document.getElementById("gf-minutes");
  const secondsEl = document.getElementById("gf-seconds");
  const countdownWrapper = document.getElementById("gamefest-countdown");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !countdownWrapper) return;

  // July 11, 2026 at 12:00 AM Guyana time (UTC-4)
  const eventDate = new Date("2026-07-11T00:00:00-04:00").getTime();

  const pad = (value) => String(value).padStart(2, "0");

  function updateCountdown() {
    const now = Date.now();
    const distance = eventDate - now;

    if (distance <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";

      countdownWrapper.innerHTML = `
        <div class="rounded-2xl border border-gamefest/40 bg-black/40 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
          <span class="block text-2xl font-extrabold text-gamefest sm:text-3xl">GameFest 2026 is here!</span>
        </div>
      `;
      clearInterval(timer);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
})();