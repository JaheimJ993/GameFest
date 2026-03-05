// createForm_updated.js
// Renders the signup form AFTER tournament details load and provide the team size.
// Adds client-side validation with an in-form dropdown error panel.

function initCreateForm() {
  const signupContainer = document.getElementById("signup-form");
  if (!signupContainer) return;

  const safeTeamSize = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 1;
  };

  const buildPlayerFields = (teamSize) =>
    Array.from({ length: teamSize }, (_, i) => {
      const idx = i + 1;
      return `
        <div>
          <label for="player-${idx}" class="mb-2 block text-sm font-semibold text-white/90">Player ${idx}</label>
          <input
            id="player-${idx}"
            name="players[]"
            type="text"
            placeholder="e.g., Player ${idx}"
            required
            minlength="2"
            maxlength="32"
            class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
          />
        </div>
      `;
    }).join("");

  function createForm(teamSizeRaw) {
    const teamSize = safeTeamSize(teamSizeRaw);

    signupContainer.innerHTML = `
      <section class="w-full bg-gradient2 py-12 text-white">
        <div class="mx-auto w-[92%] max-w-3xl">
          <header class="mb-8">
            <p class="mt-2 text-white/70">
              ${teamSize < 2 ? "Enter your name and contact details" : "Enter your team name, player names, and contact details."}
            </p>
          </header>

          <form id="teamRegistrationForm" class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-8" novalidate>
            <!-- Error dropdown -->
            <div id="formErrorDropdown" class="hidden mb-6 overflow-hidden rounded-2xl border border-red-500/25 bg-red-500/10 shadow-2xl">
              <div class="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <h3 class="text-sm font-black tracking-[0.12em] text-red-300">PLEASE FIX THE FOLLOWING</h3>
                  <ul id="formErrorList" class="mt-3 list-disc space-y-1 pl-5 text-sm text-white/90"></ul>
                </div>
                <button type="button" id="closeFormError"
                  class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white">
                  Close
                </button>
              </div>
            </div>

            <!-- Team -->
            <div class="mb-6 ${teamSize === 1 ? "hidden" : ""}">
              <label for="teamName" class="mb-2 block text-sm font-semibold text-white/90">Team Name</label>
              <input
                id="teamName"
                name="teamName"
                type="text"
                placeholder="e.g., WAVE Warriors"
                autocomplete="organization"
                ${teamSize === 1 ? "" : "required"}
                minlength="2"
                maxlength="40"
                class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
              />
            </div>

            <!-- Players -->
            <div class="mb-8">
              <h3 class="text-lg font-bold">Player Names</h3>

              <div class="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))]">
                ${buildPlayerFields(teamSize)}
              </div>
            </div>

            <!-- Contact -->
            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label for="phone" class="mb-2 block text-sm font-semibold text-white/90">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputmode="tel"
                  placeholder="e.g., 444-5555"
                  autocomplete="tel"
                  title="Number must be entered as: xxx-xxxx"
                  required
                  pattern="\d{3}-\d{4}"
                  maxlength="8"
                  class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
                <p class="mt-2 text-xs text-white/50">Format: 444-5555</p>
              </div>

              <div>
                <label for="email" class="mb-2 block text-sm font-semibold text-white/90">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g., team@email.com"
                  autocomplete="email"
                  required
                  maxlength="80"
                  class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="reset"
                id="clearFormBtn"
                class="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>

              <button
                type="submit"
                id="submitRegistration"
                class="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-zinc-950 transition hover:opacity-90"
              >
                Submit Registration
              </button>
            </div>
          </form>
        </div>
      </section>
    `;

    // Wire close button + hide-on-edit behavior
    const form = document.getElementById("teamRegistrationForm");
    const closeBtn = document.getElementById("closeFormError");
    const clearBtn = document.getElementById("clearFormBtn");

    const hideErrors = () => {
      const box = document.getElementById("formErrorDropdown");
      if (box) box.classList.add("hidden");
      const list = document.getElementById("formErrorList");
      if (list) list.innerHTML = "";
    };

    if (closeBtn) closeBtn.addEventListener("click", hideErrors);
    if (clearBtn) clearBtn.addEventListener("click", hideErrors);

    if (form) {
      form.addEventListener("input", hideErrors, { passive: true });
      form.addEventListener("change", hideErrors, { passive: true });
    }
  }

  // 1) Preferred: event from loadTournaments_updated.js
  window.addEventListener("tournament:ready", (e) => {
    createForm(e?.detail?.teamSize);
  });

  // 2) Fallback: read global if the event already fired before this script loaded
  if (window.__TOURNAMENT__?.teamSize) {
    createForm(window.__TOURNAMENT__.teamSize);
    return;
  }

  // 3) Fallback: read from DOM if already rendered
  const teamSizeEl = document.getElementById("team-size");
  if (teamSizeEl) createForm(teamSizeEl.dataset.teamSize);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCreateForm);
} else {
  initCreateForm();
}

// --- validation helpers ---
const showFormErrors = (errors) => {
  const box = document.getElementById("formErrorDropdown");
  const list = document.getElementById("formErrorList");
  if (!box || !list) return;

  list.innerHTML = errors.map((e) => `<li>${e}</li>`).join("");
  box.classList.remove("hidden");
  box.scrollIntoView({ behavior: "smooth", block: "start" });
};

const normalize = (s) => String(s ?? "").trim();

const validateRegistrationForm = (form) => {
  const errors = [];

  const tournamentId = window.__TOURNAMENT__?.id ?? null;
  const teamSize = window.__TOURNAMENT__?.teamSize ?? null;

  const teamNameInput = form.querySelector("#teamName");
  const teamName = normalize(teamNameInput?.value);

  if (teamSize && Number(teamSize) > 1) {
    if (!teamName) errors.push("Team name is required.");
    else if (teamName.length < 2) errors.push("Team name must be at least 2 characters.");
  }

  const playerInputs = [...form.querySelectorAll('input[name="players[]"]')];
  const players = playerInputs.map((i) => normalize(i.value));

  players.forEach((p, idx) => {
    if (!p) errors.push(`Player ${idx + 1} name is required.`);
    else {
      if (p.length < 2) errors.push(`Player ${idx + 1} name must be at least 2 characters.`);
      if (p.length > 32) errors.push(`Player ${idx + 1} name must be 32 characters or less.`);
    }
  });

  const seen = new Set();
  const dupes = new Set();
  players
    .filter(Boolean)
    .map((p) => p.toLowerCase())
    .forEach((p) => {
      if (seen.has(p)) dupes.add(p);
      seen.add(p);
    });
  if (dupes.size) errors.push("Player names must be unique (no duplicates).");

  if (teamSize && players.filter(Boolean).length !== Number(teamSize)) {
    errors.push(`Please enter exactly ${teamSize} player name(s).`);
  }

  const phoneInput = form.querySelector("#phone");
  const phone = normalize(phoneInput?.value);
  const phonePattern = /^\d{3}-\d{4}$/;
  if (!phone) errors.push("Phone number is required.");
  else if (!phonePattern.test(phone)) errors.push("Phone number must be in the format 444-5555.");

  const emailInput = form.querySelector("#email");
  const email = normalize(emailInput?.value);
  if (!email) errors.push("Email address is required.");
  else if (emailInput && !emailInput.checkValidity()) errors.push("Please enter a valid email address.");

  if (!tournamentId) errors.push("Tournament ID is missing. Please reload the page and try again.");

  return {
    ok: errors.length === 0,
    errors,
    payload: {
      tournamentId,
      teamName: teamSize === 1 ? null : (teamName || null),
      phone,
      email,
      players: players.filter(Boolean),
    },
  };
};

// --- submit handler ---
document.addEventListener("submit", async (e) => {
  if (!e.target.matches("#teamRegistrationForm")) return;

  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector("#submitRegistration");

  const { ok, errors, payload } = validateRegistrationForm(form);

  if (!ok) {
    showFormErrors(errors);
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-70", "cursor-not-allowed");
    submitBtn.textContent = "Submitting...";
  }

  try {
    await axios.post("/2026/tournaments/api/register-team", payload);

    // success message using same dropdown
    const box = document.getElementById("formErrorDropdown");
    const list = document.getElementById("formErrorList");
    if (box && list) {
      box.classList.remove("border-red-500/25", "bg-red-500/10");
      box.classList.add("border-green-500/25", "bg-green-500/10");
      const title = box.querySelector("h3");
      if (title) {
        title.textContent = "SUCCESS";
        title.classList.remove("text-red-300");
        title.classList.add("text-green-300");
      }
      list.innerHTML = `<li class="list-none">Registration submitted successfully.</li>`;
      box.classList.remove("hidden");
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    form.reset();
  } catch (err) {
    console.error(err);
    showFormErrors(["Failed to submit registration. Please try again."]);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
      submitBtn.textContent = "Submit Registration";
    }
  }
});
