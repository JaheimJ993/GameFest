document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tournamentCreateForm");
  const modal = document.getElementById("tournamentModal");
  const tournamentContainer = document.getElementById("tournamentContainer");

  const newTournamentButton = document.getElementById("newTournament");
  const editTournamentButton = document.getElementById("editTournament");
  const createButton = document.getElementById("createTournament");
  const closeTournamentButton = document.getElementById("closeTournament");
  const closeTournamentModalButton = document.getElementById("closeTournamentModal");

  const gameName = document.getElementById("gameName");
  const gameIconUrl = document.getElementById("gameIconUrl");
  const players = document.getElementById("players");
  const regFee = document.getElementById("regFee");
  const firstPrize = document.getElementById("prize1");
  const secondPrize = document.getElementById("prize2");
  const thirdPrize = document.getElementById("prize3");
  const regCloseDate = document.getElementById("regCloseDate");

  const errorBox = document.getElementById("tournamentErrorDropdown");
  const errorList = document.getElementById("tournamentErrorList");
  const closeErrorBtn = document.getElementById("closeTournamentError");

  if (!form || !modal || !editTournamentButton || !createButton) return;

  const heading = form.querySelector("h2");
  const subheading = heading?.nextElementSibling;

  const state = {
    mode: "create",
    submitting: false,
    selectedTournament: null,
    originalHeading: heading?.textContent || "Tournament Registration",
    originalSubheading: subheading?.textContent || "Add game and tournament details.",
    originalButtonText: createButton.textContent || "Create Tournament",
  };

  const normalize = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const allowedPlatforms = new Set(["Mobile", "PC", "Xbox", "PS5"]);
  const allowedCategories = new Set(["FPS", "Sports", "Fighting", "Other"]);

  const isValidUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const toInt = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  };

  const normalizePlatforms = (platforms) => {
    let list = [];

    if (Array.isArray(platforms)) {
      list = platforms;
    } else if (typeof platforms === "string") {
      try {
        const parsed = JSON.parse(platforms);
        list = Array.isArray(parsed) ? parsed : String(platforms).split(",");
      } catch {
        list = String(platforms).split(",");
      }
    }

    return list
      .map((item) => normalize(item))
      .filter((item) => allowedPlatforms.has(item))
      .sort();
  };

  const platformsKey = (platforms) => normalizePlatforms(platforms).join("|");

  const getGameCategory = () => {
    const selected = document.querySelector('input[name="gameCategory"]:checked');
    return selected ? selected.value : null;
  };

  const getPlatforms = () =>
    Array.from(document.querySelectorAll('input[name="platforms"]:checked'))
      .map((input) => input.value)
      .filter((value) => allowedPlatforms.has(value));

  const showErrors = (errors) => {
    if (!errorBox || !errorList) return;
    errorList.innerHTML = errors.map((error) => `<li>${error}</li>`).join("");
    errorBox.classList.remove("hidden");
    errorBox.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hideErrors = () => {
    if (!errorBox || !errorList) return;
    errorList.innerHTML = "";
    errorBox.classList.add("hidden");
  };

  const setCheckedValue = (name, value) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.checked = input.value === value;
    });
  };

  const setCheckedValues = (name, values) => {
    const selectedValues = new Set(normalizePlatforms(values));
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.checked = selectedValues.has(input.value);
    });
  };

  const fillForm = (tournament) => {
    gameName.value = tournament?.game_name ?? "";
    gameIconUrl.value = tournament?.game_icon ?? "";
    players.value = tournament?.team_size ?? "";
    regFee.value = tournament?.reg_fee ?? "";
    firstPrize.value = tournament?.first_prize ?? "";
    secondPrize.value = tournament?.second_prize ?? "";
    thirdPrize.value = tournament?.third_prize ?? "";
    regCloseDate.value = tournament?.reg_end ?? "";

    setCheckedValue("gameCategory", tournament?.game_category ?? "");
    setCheckedValues("platforms", tournament?.platforms ?? []);
  };

  const buildPayload = () => ({
    gameName: normalize(gameName?.value),
    gameCategory: getGameCategory(),
    gameIcon: normalize(gameIconUrl?.value),
    players: toInt(players?.value),
    platforms: getPlatforms(),
    regFee: toInt(regFee?.value),
    prize1: toInt(firstPrize?.value),
    prize2: toInt(secondPrize?.value),
    prize3: toInt(thirdPrize?.value),
    regCloseDate: regCloseDate?.value,
  });

  const validatePayload = (payload) => {
    const errors = [];

    if (!payload.gameName) errors.push("Game name is required.");
    else if (payload.gameName.length < 2) errors.push("Game name must be at least 2 characters.");
    else if (payload.gameName.length > 60) errors.push("Game name must be 60 characters or less.");

    if (!payload.gameCategory) errors.push("Game category is required.");
    else if (!allowedCategories.has(payload.gameCategory)) errors.push("Game category is invalid.");

    if (!payload.gameIcon) errors.push("Game icon URL is required.");
    else if (!isValidUrl(payload.gameIcon)) errors.push("Game icon URL must be a valid http(s) URL.");

    if (!Number.isInteger(payload.players)) errors.push("Number of players must be a whole number.");
    else if (payload.players < 1 || payload.players > 4) errors.push("Number of players must be between 1 and 4.");

    if (!Array.isArray(payload.platforms) || payload.platforms.length === 0) {
      errors.push("Select at least one platform (Mobile, PC, Xbox, PS5).");
    }

    if (!Number.isFinite(payload.regFee)) errors.push("Registration fee (reg_fee) is required.");
    else if (payload.regFee < 0) errors.push("Registration fee (reg_fee) cannot be negative.");

    [
      ["1st prize", payload.prize1],
      ["2nd prize", payload.prize2],
      ["3rd prize", payload.prize3],
    ].forEach(([label, value]) => {
      if (!Number.isFinite(value)) errors.push(`${label} is required.`);
      else if (value < 0) errors.push(`${label} cannot be negative.`);
    });

    if (!payload.regCloseDate) errors.push("Registration close date is required.");
    else if (payload.regCloseDate < todayISO()) errors.push("Registration close date cannot be in the past.");

    return errors;
  };

  const updateButtonState = (enabled) => {
    editTournamentButton.disabled = !enabled;
    editTournamentButton.classList.toggle("opacity-60", !enabled);
    editTournamentButton.classList.toggle("cursor-not-allowed", !enabled);
    editTournamentButton.classList.toggle("bg-yellow-500/60", !enabled);
    editTournamentButton.classList.toggle("bg-yellow-500", enabled);
    editTournamentButton.classList.toggle("text-white/80", !enabled);
    editTournamentButton.classList.toggle("text-black", enabled);
    editTournamentButton.classList.toggle("hover:cursor-pointer", enabled);
  };

  const setCreateMode = () => {
    state.mode = "create";
    state.submitting = false;
    if (heading) heading.textContent = state.originalHeading;
    if (subheading) subheading.textContent = state.originalSubheading;
    createButton.textContent = state.originalButtonText;
    createButton.dataset.mode = "create";
    delete createButton.dataset.editId;
    hideErrors();
  };

  const setEditMode = (tournament) => {
    state.mode = "edit";
    state.selectedTournament = tournament;
    if (heading) heading.textContent = "Edit Tournament";
    if (subheading) subheading.textContent = "Update game and tournament details.";
    createButton.textContent = "Update Tournament";
    createButton.dataset.mode = "edit";
    createButton.dataset.editId = String(tournament.id);
  };

  const setSubmittingState = (submitting) => {
    state.submitting = submitting;
    createButton.disabled = submitting;
    createButton.classList.toggle("opacity-70", submitting);
    createButton.classList.toggle("cursor-not-allowed", submitting);
    createButton.textContent = submitting ? "Updating..." : "Update Tournament";
  };

  const updateTournamentCache = (updatedTournament) => {
    if (!Array.isArray(window.__ADMIN_TOURNAMENTS__) || !updatedTournament?.id) return;

    const index = window.__ADMIN_TOURNAMENTS__.findIndex((item) => String(item.id) === String(updatedTournament.id));
    if (index === -1) {
      window.__ADMIN_TOURNAMENTS__.unshift(updatedTournament);
      return;
    }

    window.__ADMIN_TOURNAMENTS__[index] = updatedTournament;
  };

  const getSelectedCard = () => {
    return document.querySelector(
      "[data-selected='true'], [aria-selected='true'], .selected, .selected-tournament, .tournament-card.selected, .admin-tournament-card.selected"
    );
  };

  const getTournamentIdFromCard = (card) => {
    if (!card) return null;
    return (
      card.dataset?.id ||
      card.dataset?.tournamentId ||
      card.getAttribute("data-id") ||
      card.getAttribute("data-tournament-id") ||
      card.getAttribute("data-row-id") ||
      card.getAttribute("data-game-id") ||
      null
    );
  };

  const getSelectedTournamentIdFromDom = () => {
    const selectedCard = getSelectedCard();
    return getTournamentIdFromCard(selectedCard);
  };

  const getTournamentFromCache = (id) => {
    if (!id || !Array.isArray(window.__ADMIN_TOURNAMENTS__)) return null;
    return window.__ADMIN_TOURNAMENTS__.find((item) => String(item.id) === String(id)) ?? null;
  };

  const fetchTournamentById = async (id) => {
    if (!id) return null;

    try {
      const res = await axios.get("/2026/api/get-tournament", { params: { id } });
      const tournament = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data ?? null;

      if (tournament?.id && Array.isArray(window.__ADMIN_TOURNAMENTS__)) {
        const index = window.__ADMIN_TOURNAMENTS__.findIndex((item) => String(item.id) === String(tournament.id));
        if (index === -1) window.__ADMIN_TOURNAMENTS__.unshift(tournament);
        else window.__ADMIN_TOURNAMENTS__[index] = tournament;
      }

      return tournament;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const hasDuplicateTournament = async (candidate, currentId) => {
    let list = window.__ADMIN_TOURNAMENTS__ ?? null;

    if (!Array.isArray(list)) {
      try {
        const res = await axios.get("/admin/api/getTournaments");
        list = res.data?.data ?? [];
        window.__ADMIN_TOURNAMENTS__ = list;
      } catch {
        return false;
      }
    }

    const nameKey = normalize(candidate.gameName).toLowerCase();
    const category = candidate.gameCategory;
    const regEnd = candidate.regCloseDate;
    const platKey = platformsKey(candidate.platforms);

    return list.some((tournament) => {
      if (String(tournament.id) === String(currentId)) return false;

      const existingName = normalize(tournament.game_name).toLowerCase();
      const existingPlatforms = platformsKey(tournament.platforms);

      return (
        existingName === nameKey &&
        tournament.game_category === category &&
        String(tournament.reg_end) === String(regEnd) &&
        existingPlatforms === platKey
      );
    });
  };

  const openInEditMode = async (tournament) => {
    let selectedTournament = tournament ?? state.selectedTournament;

    if (!selectedTournament?.id) {
      const selectedId = getSelectedTournamentIdFromDom();
      selectedTournament = getTournamentFromCache(selectedId) ?? (await fetchTournamentById(selectedId));
    }

    if (!selectedTournament?.id) {
      showErrors([
        "The card click is not exposing a tournament id yet. Add data-id=\"${tournament.id}\" to the card or dispatch a tournament:selected event from displayTournaments.js.",
      ]);
      return;
    }

    fillForm(selectedTournament);
    setEditMode(selectedTournament);
    hideErrors();
    modal.classList.remove("hidden");
  };

  const closeModalAndReset = () => {
    modal.classList.add("hidden");
    setCreateMode();
  };

  const submitEdit = async () => {
    const tournamentId = state.selectedTournament?.id || createButton.dataset.editId;

    if (!tournamentId) {
      showErrors(["No tournament is selected for editing."]);
      return;
    }

    hideErrors();

    const payload = buildPayload();
    const errors = validatePayload(payload);
    if (errors.length) {
      showErrors(errors);
      return;
    }

    const duplicate = await hasDuplicateTournament(payload, tournamentId);
    if (duplicate) {
      showErrors(["This tournament already exists (same game, category, close date, and platforms)."]);
      return;
    }

    setSubmittingState(true);

    try {
      const res = await axios.put(`/admin/api/tournaments/${tournamentId}`, payload);
      const updatedTournament = res.data?.data ?? null;

      updateTournamentCache(updatedTournament);
      state.selectedTournament = updatedTournament ?? state.selectedTournament;

      window.dispatchEvent(new CustomEvent("tournaments:refresh"));
      document.dispatchEvent(new CustomEvent("tournament:updated", { detail: { tournament: updatedTournament } }));

      modal.classList.add("hidden");
      setCreateMode();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length) {
        showErrors(apiErrors);
      } else {
        showErrors(["Failed to update tournament. Please try again."]);
      }
      console.error(err);
    } finally {
      setSubmittingState(false);
    }
  };

  const markSelectedCard = (card) => {
    if (!tournamentContainer || !card) return;

    tournamentContainer
      .querySelectorAll("[data-id], [data-tournament-id], .tournament-card, .admin-tournament-card, .selected, [aria-selected='true']")
      .forEach((node) => {
        node.classList.remove("selected");
        node.removeAttribute("aria-selected");
        node.dataset.selected = "false";
      });

    card.classList.add("selected");
    card.setAttribute("aria-selected", "true");
    card.dataset.selected = "true";
  };

  const syncStateFromEvent = (tournament) => {
    state.selectedTournament = tournament?.id ? tournament : null;
    updateButtonState(Boolean(state.selectedTournament?.id));
  };

  const syncStateFromDom = async (clickedElement = null) => {
    const card = clickedElement?.closest?.(
      "[data-id], [data-tournament-id], [data-row-id], [data-game-id], .tournament-card, .admin-tournament-card"
    ) || getSelectedCard();

    if (card) markSelectedCard(card);

    const selectedId = getTournamentIdFromCard(card) || getSelectedTournamentIdFromDom();
    if (!selectedId) {
      syncStateFromEvent(null);
      return;
    }

    const tournament = getTournamentFromCache(selectedId) ?? (await fetchTournamentById(selectedId));
    syncStateFromEvent(tournament);
  };

  if (closeErrorBtn) closeErrorBtn.addEventListener("click", hideErrors);
  form.addEventListener("input", hideErrors, { passive: true });
  form.addEventListener("change", hideErrors, { passive: true });

  editTournamentButton.addEventListener("click", async () => {
    await openInEditMode();
  });

  createButton.addEventListener(
    "click",
    async (event) => {
      if (state.mode !== "edit") return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (state.submitting) return;
      await submitEdit();
    },
    true
  );

  newTournamentButton?.addEventListener("click", () => {
    setCreateMode();
  });

  closeTournamentButton?.addEventListener("click", closeModalAndReset);
  closeTournamentModalButton?.addEventListener("click", closeModalAndReset);

  document.addEventListener("tournament:selected", (event) => {
    const tournament = event.detail?.tournament ?? null;
    const card = event.detail?.card ?? null;

    if (card) {
      const tournamentId = tournament?.id || getTournamentIdFromCard(card);
      if (tournamentId && !card.dataset.id && !card.dataset.tournamentId) {
        card.dataset.id = String(tournamentId);
      }
      markSelectedCard(card);
    }

    syncStateFromEvent(tournament);
  });

  document.addEventListener("tournament:cleared", () => {
    syncStateFromEvent(null);
  });

  tournamentContainer?.addEventListener("click", async (event) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await syncStateFromDom(event.target);
  });

  window.addEventListener("tournaments:refresh", () => {
    setTimeout(() => {
      syncStateFromDom();
    }, 150);
  });

  setCreateMode();
  updateButtonState(false);
  window.openTournamentEditor = openInEditMode;
});
