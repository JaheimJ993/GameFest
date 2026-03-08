// loadTournaments_updated.js
// Loads tournament details, renders them, and notifies other scripts (createForm_updated.js) of tournament meta.

document.addEventListener("DOMContentLoaded", () => {
  const tournamentDetails = document.getElementById("tournament-details-container");
  const loadOverlay = document.getElementById("loadingOverlay");
  if (!tournamentDetails) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  const formatter = new Intl.NumberFormat("en-US");
  const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const formatFee = (v) => {
    const n = safeNumber(v);
    if (n === null) return "N/A";
    if (n === 0) return "Free";
    return formatter.format(n);
  };

  const normalizePlatforms = (platforms) => {
    if (!platforms) return [];

    // Array already
    if (Array.isArray(platforms)) return platforms.map(String).map(s => s.trim()).filter(Boolean);

    // Object (e.g. { Mobile: true, PC: false } or { mobile: true, pc: true })
    if (typeof platforms === "object") {
      try {
        return Object.entries(platforms)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => String(k).trim())
          .filter(Boolean);
      } catch {
        return [];
      }
    }

    // String (CSV or JSON string)
    if (typeof platforms === "string") {
      const trimmed = platforms.trim();
      if (!trimmed) return [];

      // Try JSON first (["Mobile","PC"] or {"Mobile":true,...})
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
        try {
          const parsed = JSON.parse(trimmed);
          return normalizePlatforms(parsed);
        } catch {
          // fall through
        }
      }

      // CSV fallback
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Everything else
    return [String(platforms)].map(s => s.trim()).filter(Boolean);
  };

  const platformPills = (platforms) => {
    const list = normalizePlatforms(platforms);
    if (!list.length) return `<span class="text-base font-semibold tracking-tight text-white/95">N/A</span>`;

    return `
      <div class="flex max-w-[260px] flex-wrap justify-end gap-2 text-right">
        ${list
          .map(
            (p) => `
              <span class="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                ${p}
              </span>
            `
          )
          .join("")}
      </div>
    `;
  };

  const tournamentData = async () => {
    if (loadOverlay) loadOverlay.classList.remove("hidden");

    // Basic guard
    if (!Number.isFinite(id) || id <= 0) {
      tournamentDetails.innerHTML = `
        <div class="w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
          Invalid tournament id.
        </div>
      `;
      if (loadOverlay) loadOverlay.classList.add("hidden");
      return;
    }

    try {
      const response = await axios.get("/2026/api/get-tournament", { params: { id } });
      const tournament = response.data?.data?.[0];

      if (!tournament) {
        tournamentDetails.innerHTML = `
          <div class="w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
            Tournament not found.
          </div>
        `;
        return;
      }

      // Make tournament meta available even if other scripts load later.
      window.__TOURNAMENT__ = {
        id,
        teamSize: tournament.team_size,
        regFee: tournament.reg_fee,
        platforms: tournament.platforms,
      };

      tournamentDetails.innerHTML = `
        <!-- Image -->
        <div class="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl transition hover:border-white/20 hover:bg-white/10 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,.75)] md:w-[48%]">
          <img src="${tournament.game_icon}" alt="${tournament.game_name}" class="mx-auto h-full w-full object-cover transition duration-500 ease-out hover:scale-[1.03]" />
        </div>

        <!-- Game Information -->
        <div class="flex min-h-[465px] w-full flex-col gap-4 rounded-2xl border border-white/10 bg-gradient1 p-7 shadow-2xl backdrop-blur-sm transition hover:border-white/20 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,.75)] md:w-[48%]">
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

          <!-- Platforms (NEW) -->
          <div class="flex h-fit w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
            <p class="text-sm font-semibold tracking-wide text-white/60">Platforms</p>
            ${platformPills(tournament.platforms)}
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

          <!-- Registration Fee (NEW) -->
          <div class="flex h-fit w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
            <p class="text-sm font-semibold tracking-wide text-white/60">Registration Fee</p>
            <p class="text-base font-semibold tracking-tight text-white/95">${formatFee(tournament.reg_fee)}</p>
          </div>

          <!-- Registration end -->
          <div class="flex h-fit w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm">
            <p class="text-sm font-semibold tracking-wide text-white/60">Registration End</p>
            <p class="text-base font-semibold tracking-tight text-white/95">${tournament.reg_end}</p>
          </div>

          <!-- Sign Up -->
          <a
            href="#signup-form"
            class="mx-auto mt-auto block w-[80%] rounded-2xl bg-gamefest py-3 text-center text-2xl font-extrabold tracking-[0.18em] text-black shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl hover:brightness-95 active:translate-y-0"
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
            <p class="mt-2 text-3xl font-extrabold tracking-[0.12em] text-green-400">${formatter.format(safeNumber(tournament.first_prize) ?? 0)}</p>
          </div>

          <!-- Second Prize -->
          <div class="flex w-full flex-col rounded-2xl border border-white/10 bg-gradient2 p-6 shadow-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl sm:w-[250px]">
            <h1 class="text-sm font-semibold tracking-wide text-white/60">Second Prize</h1>
            <p class="mt-2 text-3xl font-extrabold tracking-[0.12em] text-green-400">${formatter.format(safeNumber(tournament.second_prize) ?? 0)}</p>
          </div>

          <!-- Third Prize -->
          <div class="flex w-full flex-col rounded-2xl border border-white/10 bg-gradient2 p-6 shadow-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl sm:w-[250px]">
            <h1 class="text-sm font-semibold tracking-wide text-white/60">Third Prize</h1>
            <p class="mt-2 text-3xl font-extrabold tracking-[0.12em] text-green-400">${formatter.format(safeNumber(tournament.third_prize) ?? 0)}</p>
          </div>
        </div>
      `;

      // Notify other files (createForm_updated.js) that tournament data is ready.
      window.dispatchEvent(
        new CustomEvent("tournament:ready", {
          detail: {
            id,
            teamSize: tournament.team_size,
            regFee: tournament.reg_fee,
            platforms: tournament.platforms,
          },
        })
      );
    } catch (err) {
      tournamentDetails.innerHTML = `
        <div class="w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
          Failed to load tournament.
        </div>
      `;
    } finally {
      if (loadOverlay) loadOverlay.classList.add("hidden");
    }
  };

  tournamentData();
});