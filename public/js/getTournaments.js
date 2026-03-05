document.addEventListener('DOMContentLoaded', () => {
  const tournamentContainer = document.getElementById("tournaments-container");
  const loader = document.getElementById("tournamentsLoader");

  const usdFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const gyFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  });

  const setLoading = (isLoading) => {
    if (!loader) return;
    loader.classList.toggle("hidden", !isLoading);
    loader.classList.toggle("flex", isLoading);
  };

  const parsePlatforms = (platforms) => {
    if (Array.isArray(platforms)) return platforms.filter(Boolean);
    if (typeof platforms === "string") {
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
      return platforms.split(",").map((x) => x.trim()).filter(Boolean);
    }
    return [];
  };

  const platformBadges = (platforms) => {
    const list = parsePlatforms(platforms);
    if (!list.length) return `<span class="text-white/60">—</span>`;
    return list
      .map((p) => `<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">${p}</span>`)
      .join("");
  };

  const renderEmpty = () => {
    if (!tournamentContainer) return;
    tournamentContainer.innerHTML = `
      <div class="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
        No tournaments found.
      </div>
    `;
  };

  const getTournaments = async () => {
    if (!tournamentContainer) return;

    setLoading(true);

    try {
      const data = await axios.get("/admin/api/getTournaments");
      const tournaments = data.data?.data ?? [];

      tournamentContainer.innerHTML = "";

      if (!tournaments.length) {
        renderEmpty();
        return;
      }

      tournaments.forEach(tournament => {
        const row = document.createElement("div");
        row.id = tournament.id;

        row.className = "flex flex-col justify-center rounded-2xl border-2 border-gradient1 px-4 py-4 duration-150 hover:bg-gradient1 hover:shadow-2xl max-lg:w-[560px] max-lg:gap-y-[22px] md:gap-x-[20px] lg:w-full lg:flex-row lg:items-center";

        const regFee = Number(tournament.reg_fee ?? 0);

        row.innerHTML = `
          <img id="gameIcon" class="mx-auto w-[300px] rounded-2xl lg:w-[110px] shadow-2xl" src="${tournament.game_icon}" />

          <div class="mx-auto w-[340px]">
            <h1 id="gameName" class="text-2xl font-bold tracking-[3px]">${tournament.game_name}</h1>
            <p id="gameCategory" class="text-md font-semibold">${tournament.game_category}</p>
          </div>

          <div class="mx-auto w-[340px]">
            <h1 class="text-2xl font-bold tracking-[3px]">Platforms:</h1>
            <div class="mt-2 flex flex-wrap gap-2">
              ${platformBadges(tournament.platforms)}
            </div>
          </div>

          <div class="mx-auto w-[340px]">
            <h1 class="text-2xl font-bold tracking-[3px]">Team Size:</h1>
            <h1 id="teamSize" class="text-md font-medium tracking-[2px]">
              ${tournament.team_size} ${tournament.team_size == 1 ? "Player" : "Players"}
            </h1>
          </div>

          <div class="mx-auto w-[340px]">
            <h1 class="text-2xl font-bold tracking-[3px]">Reg Fee:</h1>
            <h1 class="text-md font-medium tracking-[2px] text-white/90">${gyFormatter.format(regFee)} GYD</h1>
          </div>

          <div class="mx-auto w-[340px]">
            <h1 class="text-2xl font-bold tracking-[3px]">First Prize:</h1>
            <h1 id="prize1" class="text-md font-medium tracking-[2px] text-green-400">$${usdFormatter.format(tournament.first_prize)}</h1>
          </div>

          <div class="mx-auto w-[340px]">
            <h1 class="text-2xl font-bold tracking-[3px]">Sign-Up:</h1>
            <h1 id="regEnd" class="text-md font-medium tracking-[2px] text-red-500">${tournament.reg_end}</h1>
          </div>

          <div class="mx-auto w-fit">
            <a href="2026/tournaments/?id=${tournament.id}">
              <button class="rounded-[10px] border-gamefest bg-gamefest px-6 py-4 text-xl font-bold text-black duration-150 hover:cursor-pointer hover:brightness-75">
                More Details
              </button>
            </a>
          </div>
        `;

        tournamentContainer.appendChild(row);
      });

    } catch (err) {
      console.log(err);
      renderEmpty();
    } finally {
      setLoading(false);
    }
  };

  getTournaments();
});
