// loadTournaments.js
// Loads tournament details, renders them, and notifies other scripts (createForm.js) of team size.

document.addEventListener("DOMContentLoaded", () => {
  const tournamentDetails = document.getElementById("tournament-details-container");
  const loadOverlay = document.getElementById("loadingOverlay")
  if (!tournamentDetails) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  const formatter = new Intl.NumberFormat("en-US", {
  });

  const tournamentData = async () => {
    loadOverlay.classList.remove("hidden")
    try {
      const response = await axios.get("/2026/api/get-tournament", { params: { id } });
      
      const tournament = response.data?.data?.[0];

      if (!tournament) return;
      
      // Make team size available even if other scripts load later.
      window.__TOURNAMENT__ = { teamSize: tournament.team_size, id };

      tournamentDetails.innerHTML = `
        <!-- Image -->
        <div class="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl transition hover:border-white/20 hover:bg-white/10 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,.75)] md:w-[48%]">
          <img src="${tournament.game_icon}" alt="${tournament.game_name}" class="mx-auto h-full w-full object-cover transition duration-500 ease-out hover:scale-[1.03]" />
        </div>

        <!-- Game Information -->
        <div class="flex h-[465px] w-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient1 p-7 shadow-2xl backdrop-blur-sm transition hover:border-white/20 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,.75)] md:w-[48%]">
          <!-- Game Name -->
          <div class="flex h-fit w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
            <p class="text-sm font-semibold tracking-wide text-white/60">Game</p>
            <p class="text-base font-semibold tracking-tight text-white/95">${tournament.game_name}</p>
          </div>

          <!-- Game Category -->
          <div class="flex h-fit w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
            <p class="text-sm font-semibold tracking-wide text-white/60">Category</p>
            <p class="text-base font-semibold tracking-tight text-white/95">${tournament.game_category}</p>
          </div>

          <!-- Team Size -->
          <div class="flex h-fit w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
            <p class="text-sm font-semibold tracking-wide text-white/60">Team Size</p>
            <p
              id="team-size"
              data-team-size="${tournament.team_size}"
              class="text-base font-semibold tracking-tight text-white/95"
            >
              ${tournament.team_size} ${tournament.team_size === 1 ? "Player" : "Players"}
            </p>
          </div>

          <!-- Registration end -->
          <div class="flex h-fit w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
            <p class="text-sm font-semibold tracking-wide text-white/60">Registration End</p>
            <p class="text-base font-semibold tracking-tight text-white/95">${tournament.reg_end}</p>
          </div>

          <!-- Sign Up -->
          <a
            class="mx-auto block w-[80%] rounded-2xl bg-gamefest py-3 text-center text-2xl font-extrabold tracking-[0.18em] text-black shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl hover:brightness-95 active:translate-y-0"
          >
            SIGN UP
          </a>
        </div>

        <!-- Prizes -->
        <div class="flex w-full flex-wrap items-center justify-around gap-6 rounded-2xl border border-white/10 bg-gradient1 p-7 shadow-2xl backdrop-blur-sm transition hover:border-white/20 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,.75)]">
          <div class="w-full pl-1">
            <h1 class="text-center text-sm font-extrabold tracking-[0.22em] text-white/60 sm:text-left">PRIZES</h1>
          </div>

          <!-- First Prize -->
          <div class="flex w-full flex-col rounded-2xl border border-white/10 bg-gradient2 p-6 shadow-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl sm:w-[250px]">
            <h1 class="text-sm font-semibold tracking-wide text-white/60">First Prize</h1>
            <p class="mt-2 text-3xl font-extrabold tracking-[0.12em] text-green-400">${formatter.format(tournament.first_prize)}</p>
          </div>

          <!-- Second Prize -->
          <div class="flex w-full flex-col rounded-2xl border border-white/10 bg-gradient2 p-6 shadow-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl sm:w-[250px]">
            <h1 class="text-sm font-semibold tracking-wide text-white/60">Second Prize</h1>
            <p class="mt-2 text-3xl font-extrabold tracking-[0.12em] text-green-400">${formatter.format(tournament.second_prize)}</p>
          </div>

          <!-- Third Prize -->
          <div class="flex w-full flex-col rounded-2xl border border-white/10 bg-gradient2 p-6 shadow-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl sm:w-[250px]">
            <h1 class="text-sm font-semibold tracking-wide text-white/60">Third Prize</h1>
            <p class="mt-2 text-3xl font-extrabold tracking-[0.12em] text-green-400">${formatter.format(tournament.third_prize)}</p>
          </div>
        </div>
      `;

      // Notify other files (createForm.js) that team size is ready.
      window.dispatchEvent(new CustomEvent("tournament:ready", { detail: { teamSize: tournament.team_size, id } }));
    } catch (err) {
      // Optional: console.error(err);
    } finally {
            loadOverlay.classList.add("hidden")
      }
  };

  tournamentData();
});
