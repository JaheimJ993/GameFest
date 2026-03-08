document.addEventListener("DOMContentLoaded", () => {
  const tournamentContainer = document.getElementById("tournamentContainer");
  const loader = document.getElementById("tournamentsLoader");
  const loaderText = document.getElementById("tournamentsLoaderText");
  const deleteBtn = document.getElementById("deleteTournament");

  const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

  let selectedTournamentId = null;
  let selectedCard = null;

  const setLoading = (isLoading, message = "Please wait while tournament data is fetched.") => {
    if (!loader) return;
    if (loaderText) loaderText.textContent = message;
    loader.classList.toggle("hidden", !isLoading);
    loader.classList.toggle("flex", isLoading);
  };

  const setDeleteEnabled = (enabled) => {
    if (!deleteBtn) return;
    deleteBtn.disabled = !enabled;

    if (enabled) {
      deleteBtn.classList.remove("opacity-60", "cursor-not-allowed", "bg-red-500/60", "text-white/80");
      deleteBtn.classList.add("opacity-100", "cursor-pointer", "bg-red-500", "text-white");
    } else {
      deleteBtn.classList.remove("opacity-100", "cursor-pointer", "bg-red-500", "text-white");
      deleteBtn.classList.add("opacity-60", "cursor-not-allowed", "bg-red-500/60", "text-white/80");
    }
  };

  const clearSelection = () => {
    selectedTournamentId = null;
    if (selectedCard) {
      selectedCard.classList.remove("ring-2", "ring-gamefest", "bg-gradient1");
      selectedCard = null;
    }
    setDeleteEnabled(false);
  };

  const selectCard = (card) => {
    const id = Number(card?.dataset?.tournamentId);
    if (!id) return;

    if (selectedTournamentId === id) {
      clearSelection();
      return;
    }

    if (selectedCard) selectedCard.classList.remove("ring-2", "ring-gamefest", "bg-gradient1");

    selectedTournamentId = id;
    selectedCard = card;
    card.classList.add("ring-2", "ring-gamefest", "bg-gradient1");
    setDeleteEnabled(true);
  };

  const renderEmpty = () => {
    if (!tournamentContainer) return;
    tournamentContainer.innerHTML = `
      <div class="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
        No tournaments found.
      </div>
    `;
  };

  const platformBadges = (platforms) => {
    let list = [];
    if (Array.isArray(platforms)) list = platforms;
    else if (typeof platforms === "string") {
      try {
        const parsed = JSON.parse(platforms);
        if (Array.isArray(parsed)) list = parsed;
        else list = String(platforms).split(",").map((x) => x.trim());
      } catch {
        list = String(platforms).split(",").map((x) => x.trim());
      }
    }

    list = list.filter(Boolean);

    if (!list.length) return `<span class="text-white/60">—</span>`;

    return list
      .map((p) => `<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">${p}</span>`)
      .join("");
  };

  const renderTournamentCard = (t) => {
    const card = document.createElement("div");
    card.dataset.tournamentId = t.id;
    card.id = t.id;

    card.className =
      "flex flex-col justify-center rounded-2xl border-2 border-gradient1 px-4 py-4 duration-150 hover:bg-gradient1 hover:shadow-2xl max-lg:w-[560px] max-lg:gap-y-[22px] md:gap-x-[20px] lg:w-full lg:flex-row lg:items-center cursor-pointer";

    const regFee = Number(t.reg_fee ?? 0);

    card.innerHTML = `
      <img class="mx-auto w-[300px] rounded-2xl lg:w-[110px] shadow-2xl" src="${t.game_icon}" />

      <div class="mx-auto w-[340px]">
        <h1 class="text-2xl font-bold tracking-[3px]">${t.game_name}</h1>
        <p class="text-md font-semibold">${t.game_category}</p>
      </div>

      <div class="mx-auto w-[340px]">
        <h1 class="text-2xl font-bold tracking-[3px]">Platforms:</h1>
        <div class="mt-2 flex flex-wrap gap-2">
          ${platformBadges(t.platforms)}
        </div>
      </div>

      <div class="mx-auto w-[340px]">
        <h1 class="text-2xl font-bold tracking-[3px]">Team Size:</h1>
        <h1 class="text-md font-medium tracking-[2px]">
          ${t.team_size} ${t.team_size == 1 ? "Player" : "Players"}
        </h1>
      </div>

      <div class="mx-auto w-[340px]">
        <h1 class="text-2xl font-bold tracking-[3px]">Reg Fee:</h1>
        <h1 class="text-md font-medium tracking-[2px] text-white/90">
          ${formatter.format(regFee)} GYD
        </h1>
      </div>

      <div class="mx-auto w-[340px]">
        <h1 class="text-2xl font-bold tracking-[3px]">First Prize:</h1>
        <h1 class="text-md font-medium tracking-[2px] text-green-400">
          $${formatter.format(t.first_prize)}
        </h1>
      </div>

      <div class="mx-auto w-[340px]">
        <h1 class="text-2xl font-bold tracking-[3px]">Sign-Up:</h1>
        <h1 class="text-md font-medium tracking-[2px] text-red-500">${t.reg_end}</h1>
      </div>

      <div class="mx-auto w-fit">
        <a href="/TMS/tournaments?tournament-id=${t.id}">
          <button class="rounded-[10px] border border-gamefest bg-gamefest px-6 py-4 text-xl font-bold text-black duration-150 hover:cursor-pointer hover:brightness-75">
            More Details
          </button>
        </a>
      </div>
    `;
    return card;
  };

  const loadTournaments = async () => {
    if (!tournamentContainer) return;

    setLoading(true, "Please wait while tournament data is fetched.");
    try {
      const res = await axios.get("/admin/api/getTournaments");
      const tournaments = res.data?.data ?? [];

      window.__ADMIN_TOURNAMENTS__ = tournaments;

      tournamentContainer.innerHTML = "";
      tournamentContainer.scrollTop = 0;
      clearSelection();

      if (!tournaments.length) {
        renderEmpty();
        return;
      }

      tournaments.forEach((t) => {
        tournamentContainer.appendChild(renderTournamentCard(t));
      });
    } catch (err) {
      console.log(err);
      renderEmpty();
    } finally {
      setLoading(false);
    }
  };

  if (tournamentContainer) {
    tournamentContainer.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      const button = e.target.closest("button");
      if (link || button) return;

      const card = e.target.closest("[data-tournament-id]");
      if (!card) return;

      selectCard(card);
    });
  }

  if (deleteBtn) {
    setDeleteEnabled(false);
    deleteBtn.addEventListener("click", async () => {
      if (!selectedTournamentId) return;

      const ok = window.confirm("Delete this tournament? This cannot be undone.");
      if (!ok) return;

      deleteBtn.disabled = true;
      setLoading(true, "Deleting tournament...");

      try {
        await axios.delete(`/admin/api/tournaments/${selectedTournamentId}`);

        if (selectedCard) selectedCard.remove();
        clearSelection();

        if (Array.isArray(window.__ADMIN_TOURNAMENTS__)) {
          window.__ADMIN_TOURNAMENTS__ = window.__ADMIN_TOURNAMENTS__.filter((t) => Number(t.id) !== selectedTournamentId);
        }

        const remaining = tournamentContainer.querySelectorAll("[data-tournament-id]");
        if (!remaining.length) renderEmpty();
      } catch (err) {
        console.log(err);
        setDeleteEnabled(!!selectedTournamentId);
      } finally {
        setLoading(false);
      }
    });
  }

  window.addEventListener("tournaments:refresh", loadTournaments);

  loadTournaments();
});
