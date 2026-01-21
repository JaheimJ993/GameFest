document.addEventListener("DOMContentLoaded", () => {
  let lastScroll = window.scrollY;
  let downAccum = 0;

  const header = document.querySelector("header");
  if (!header) return;

  header.classList.add("transition-transform", "duration-300", "will-change-transform");

  const HIDE_AFTER_Y = 200;   // increased
  const MIN_DELTA = 12;       // increased (less sensitive)
  const DOWN_TO_HIDE = 550;   // increased (must scroll down more to hide)

  let ticking = false;

  function onScroll() {
    const currentScroll = window.scrollY;
    const delta = currentScroll - lastScroll;

    if (Math.abs(delta) < MIN_DELTA) {
      ticking = false;
      return;
    }

    if (delta < 0) {
      // show on scroll up
      downAccum = 0;
      header.classList.remove("-translate-y-full");
      header.classList.add("translate-y-0");
    } else {
      // accumulate only after we're a bit down the page
      if (currentScroll > HIDE_AFTER_Y) {
        downAccum += delta;

        if (downAccum >= DOWN_TO_HIDE) {
          header.classList.remove("translate-y-0");
          header.classList.add("-translate-y-full");
        }
      }
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
});
