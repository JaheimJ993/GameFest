// createForm.js
// Renders the signup form AFTER tournament details load and provide the team size.

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
            ${idx === 1 ? "required" : ""}
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

          <form id="teamRegistrationForm" class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-8">
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
                  title="Number must be entered as follow: 'xxx-xxxx'"
                  required
                  class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
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
                  class="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="reset"
                class="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>

              <button
                type="submit"
                class="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-zinc-950 transition hover:opacity-90"
              >
                Submit Registration
              </button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  // 1) Preferred: event from loadTournaments.js
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

// createForm.js

document.addEventListener("submit", async (e) => {
  if (!e.target.matches("#teamRegistrationForm")) return;

  e.preventDefault();

  const form = e.target;

  const teamName = form.querySelector("#teamName")?.value.trim() || null;
  const phone = form.querySelector("#phone")?.value.trim();
  const email = form.querySelector("#email")?.value.trim();

  const playersArr = [...form.querySelectorAll('input[name="players[]"]')]
    .map((i) => i.value.trim())
    .filter(Boolean);

  if (!phone || !email || playersArr.length === 0) {
    alert("Please fill Phone, Email, and at least 1 Player name.");
    return;
  }

  const tournamentId = window.__TOURNAMENT__?.id ?? null;
  const teamSize = window.__TOURNAMENT__?.teamSize ?? playersArr.length;

  if (teamSize && playersArr.length !== teamSize) {
    alert(`Please enter exactly ${teamSize} player name(s).`);
    return;
  }

  // JSON column can store arrays directly. If your schema expects an object, use: { players: playersArr }
  const payload = {
    tournamentId,
    teamName: teamSize === 1 ? null : teamName,
    phone,
    email,
    players: playersArr,
  };

  try {
    const response = await axios.post("/2026/tournaments/api/register-team", payload);
    alert("Registration submitted!");
    form.reset();
  } catch (err) {
    console.error(err);
    alert("Failed to submit registration.");
  }
});
