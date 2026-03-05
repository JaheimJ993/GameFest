document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tournamentCreateForm");

  const gameName = document.getElementById("gameName");
  const gameIconUrl = document.getElementById("gameIconUrl");
  const players = document.getElementById("players");
  const regFee = document.getElementById("regFee");
  const firstPrize = document.getElementById("prize1");
  const secondPrize = document.getElementById("prize2");
  const thirdPrize = document.getElementById("prize3");
  const regCloseDate = document.getElementById("regCloseDate");
  const createButton = document.getElementById("createTournament");

  const errorBox = document.getElementById("tournamentErrorDropdown");
  const errorList = document.getElementById("tournamentErrorList");
  const closeErrorBtn = document.getElementById("closeTournamentError");

  const normalize = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const allowedPlatforms = new Set(["Mobile", "PC", "Xbox", "PS5"]);

  function getGameCategory() {
    const selectedRadio = document.querySelector('input[name="gameCategory"]:checked');
    return selectedRadio ? selectedRadio.value : null;
  }

  function getPlatforms() {
    return Array.from(document.querySelectorAll('input[name="platforms"]:checked'))
      .map((el) => el.value)
      .filter((v) => allowedPlatforms.has(v));
  }

  function showErrors(errors) {
    if (!errorBox || !errorList) return;
    errorList.innerHTML = errors.map((e) => `<li>${e}</li>`).join("");
    errorBox.classList.remove("hidden");
    errorBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function hideErrors() {
    if (!errorBox || !errorList) return;
    errorList.innerHTML = "";
    errorBox.classList.add("hidden");
  }

  if (closeErrorBtn) closeErrorBtn.addEventListener("click", hideErrors);
  if (form) {
    form.addEventListener("input", hideErrors, { passive: true });
    form.addEventListener("change", hideErrors, { passive: true });
  }

  const isValidUrl = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const normalizePlatforms = (p) => {
    let arr = [];
    if (Array.isArray(p)) arr = p;
    else if (typeof p === "string") {
      try {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed)) arr = parsed;
        else arr = String(p).split(",").map((x) => x.trim());
      } catch {
        arr = String(p).split(",").map((x) => x.trim());
      }
    }
    return arr.map((x) => normalize(x)).filter((x) => allowedPlatforms.has(x)).sort();
  };

  const platformsKey = (arr) => normalizePlatforms(arr).join("|");

  const hasDuplicateTournament = async (candidate) => {
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

    return list.some((t) => {
      const tName = normalize(t.game_name).toLowerCase();
      const tPlatKey = platformsKey(t.platforms);
      return (
        tName === nameKey &&
        t.game_category === category &&
        String(t.reg_end) === String(regEnd) &&
        tPlatKey === platKey
      );
    });
  };

  createButton?.addEventListener("click", async (e) => {
    e.preventDefault();
    hideErrors();

    const selectedCategory = getGameCategory();
    const selectedPlatforms = getPlatforms();

    const payload = {
      gameName: normalize(gameName?.value),
      gameCategory: selectedCategory,
      gameIcon: normalize(gameIconUrl?.value),
      players: toInt(players?.value),
      platforms: selectedPlatforms,
      regFee: toInt(regFee?.value),
      prize1: toInt(firstPrize?.value),
      prize2: toInt(secondPrize?.value),
      prize3: toInt(thirdPrize?.value),
      regCloseDate: regCloseDate?.value,
    };

    const errors = [];

    if (!payload.gameName) errors.push("Game name is required.");
    else if (payload.gameName.length < 2) errors.push("Game name must be at least 2 characters.");
    else if (payload.gameName.length > 60) errors.push("Game name must be 60 characters or less.");

    const allowed = new Set(["FPS", "Sports", "Fighting", "Other"]);
    if (!payload.gameCategory) errors.push("Game category is required.");
    else if (!allowed.has(payload.gameCategory)) errors.push("Game category is invalid.");

    if (!payload.gameIcon) errors.push("Game icon URL is required.");
    else if (!isValidUrl(payload.gameIcon)) errors.push("Game icon URL must be a valid http(s) URL.");

    if (!Number.isInteger(payload.players)) errors.push("Number of players must be a whole number.");
    else if (payload.players < 1 || payload.players > 4) errors.push("Number of players must be between 1 and 4.");

    if (!Array.isArray(payload.platforms) || payload.platforms.length === 0) {
      errors.push("Select at least one platform (Mobile, PC, Xbox, PS5).");
    }

    if (!Number.isFinite(payload.regFee)) errors.push("Registration fee (reg_fee) is required.");
    else if (payload.regFee < 0) errors.push("Registration fee (reg_fee) cannot be negative.");

    const prizes = [
      ["1st prize", payload.prize1],
      ["2nd prize", payload.prize2],
      ["3rd prize", payload.prize3],
    ];
    prizes.forEach(([label, val]) => {
      if (!Number.isFinite(val)) errors.push(`${label} is required.`);
      else if (val < 0) errors.push(`${label} cannot be negative.`);
    });

    if (!payload.regCloseDate) errors.push("Registration close date is required.");
    else if (payload.regCloseDate < todayISO()) errors.push("Registration close date cannot be in the past.");

    if (errors.length) {
      showErrors(errors);
      return;
    }

    const dup = await hasDuplicateTournament(payload);
    if (dup) {
      showErrors(["This tournament already exists (same game, category, close date, and platforms)."]);
      return;
    }

    const originalText = createButton.textContent;
    createButton.disabled = true;
    createButton.classList.add("opacity-70", "cursor-not-allowed");
    createButton.textContent = "Creating...";

    try {
      const res = await axios.post("/admin/newTournament", payload);

      form?.reset();
      hideErrors();

      const tournamentModal = document.getElementById("tournamentModal");
      tournamentModal?.classList.add("hidden");

      window.dispatchEvent(new CustomEvent("tournaments:refresh"));

      if (res?.data?.data && Array.isArray(window.__ADMIN_TOURNAMENTS__)) {
        window.__ADMIN_TOURNAMENTS__.unshift(res.data.data);
      }
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length) {
        showErrors(apiErrors);
      } else {
        showErrors(["Failed to create tournament. Please try again."]);
      }
      console.error(err);
    } finally {
      createButton.disabled = false;
      createButton.classList.remove("opacity-70", "cursor-not-allowed");
      createButton.textContent = originalText;
    }
  });
});
