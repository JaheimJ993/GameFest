document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("tableContent");
  const loader = document.getElementById("tableLoader");

  const confirmedBtn = document.getElementById("filterConfirmed");
  const notConfirmedBtn = document.getElementById("filterNotConfirmed");
  const deleteBtn = document.getElementById("deleteSelected");
  const exportConfirmedBtn = document.getElementById("exportConfirmedBtn");
  const searchInput = document.getElementById("searchRegistrants");
  const clearSearchBtn = document.getElementById("clearSearch");
  const resultsMeta = document.getElementById("resultsMeta");

  const tournamentName = document.getElementById("tournamentName");
  const tournamentSubtitle = document.getElementById("tournamentSubtitle");
  const tournamentIdValue = document.getElementById("tournamentIdValue");
  const tournamentCategory = document.getElementById("tournamentCategory");
  const tournamentPlatforms = document.getElementById("tournamentPlatforms");
  const tournamentTeamSize = document.getElementById("tournamentTeamSize");
  const tournamentRegFee = document.getElementById("tournamentRegFee");
  const tournamentRegEnd = document.getElementById("tournamentRegEnd");

  const confirmModal = document.getElementById("confirmModal");
  const confirmModalText = document.getElementById("confirmModalText");
  const cancelConfirmModalBtn = document.getElementById("cancelConfirmModal");
  const confirmModalActionBtn = document.getElementById("confirmModalAction");

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("tournament-id"));

  let currentFilter = null;
  let allRegistrants = [];
  let currentTournament = null;
  let selectedRegistrationId = null;
  let selectedRowEl = null;
  let pendingConfirmation = null;

  if (!tableBody) {
    console.error("Missing #tableContent tbody");
    return;
  }

  if (!id) {
    console.error("Missing tournament-id in URL. Example: ?tournament-id=2");
    return;
  }

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatCurrency = (value) => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return "--";
    return `GYD ${new Intl.NumberFormat("en-US").format(amount)}`;
  };

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const setLoading = (isLoading) => {
    if (!loader) return;
    loader.classList.toggle("hidden", !isLoading);
    loader.classList.toggle("flex", isLoading);
  };

  const setActiveFilterButton = (filter) => {
    const activeClass = "border-gamefest";
    const inactiveClass = "border-white/5";

    if (!confirmedBtn || !notConfirmedBtn) return;

    confirmedBtn.classList.remove(activeClass, inactiveClass);
    notConfirmedBtn.classList.remove(activeClass, inactiveClass);

    confirmedBtn.classList.add(filter === true ? activeClass : inactiveClass);
    notConfirmedBtn.classList.add(filter === false ? activeClass : inactiveClass);
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
    selectedRegistrationId = null;

    if (selectedRowEl) {
      selectedRowEl.classList.remove("bg-white/10");
      selectedRowEl = null;
    }

    setDeleteEnabled(false);
  };

  const setResultsMeta = (visibleCount, totalCount) => {
    if (!resultsMeta) return;

    const query = searchInput?.value?.trim();
    const hasSearch = !!query;

    if (!totalCount) {
      resultsMeta.textContent = hasSearch ? "No matching records." : "No registrants yet.";
      return;
    }

    if (hasSearch) {
      resultsMeta.textContent = `Showing ${visibleCount} of ${totalCount} registrant${totalCount === 1 ? "" : "s"}`;
      return;
    }

    resultsMeta.textContent = `${totalCount} registrant${totalCount === 1 ? "" : "s"} loaded`;
  };

  const renderEmptyState = (message = "No registrants found for this filter.") => {
    clearSelection();
    tableBody.innerHTML = "";

    const empty = document.createElement("tr");
    empty.className = "[&>td]:px-5 [&>td]:py-8";
    empty.innerHTML = `
      <td colspan="5" class="text-center text-white/60">
        ${escapeHtml(message)}
      </td>
    `;

    tableBody.appendChild(empty);
  };

  const sanitizeFileName = (value) =>
    String(value ?? "tournament")
      .trim()
      .replace(/[\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "tournament";

  const buildExportRows = (registrants) => {
    const tournamentLabel = currentTournament?.game_name ?? "Unknown Tournament";
    const categoryLabel = currentTournament?.game_category ?? "--";
    const platformsLabel = Array.isArray(currentTournament?.platforms)
      ? currentTournament.platforms.join(", ")
      : "--";
    const teamSizeLabel = currentTournament?.team_size ?? "--";
    const regFeeLabel = Number.isFinite(Number(currentTournament?.reg_fee))
      ? Number(currentTournament.reg_fee)
      : "--";
    const regEndLabel = currentTournament?.reg_end ?? "--";

    return registrants.map((registrant, index) => ({
      "#": index + 1,
      "Tournament ID": currentTournament?.id ?? id,
      "Tournament Name": tournamentLabel,
      Category: categoryLabel,
      Platforms: platformsLabel,
      "Team Size": teamSizeLabel,
      "Registration Fee (GYD)": regFeeLabel,
      "Registration Close Date": regEndLabel,
      "Registration ID": registrant.registration_id ?? "",
      "Team Name": registrant.team_name?.trim() || "Solo Entry",
      Players: Array.isArray(registrant.players) ? registrant.players.join(", ") : "",
      "Contact Number": registrant.number ? `+592 ${registrant.number}` : "",
      "Email Address": registrant.email ?? "",
      Confirmed: registrant.reg_confirmed ? "Yes" : "No",
    }));
  };

  const exportConfirmedRegistrants = async () => {
    if (!exportConfirmedBtn) return;

    if (typeof XLSX === "undefined") {
      window.alert("Excel export library failed to load.");
      return;
    }

    const defaultLabel = exportConfirmedBtn.textContent;
    exportConfirmedBtn.disabled = true;
    exportConfirmedBtn.textContent = "EXPORTING...";

    try {
      const res = await axios.get("/adminPanel/tournaments/api/registrants", {
        params: {
          id,
          confirmed: true,
        },
      });

      const confirmedRegistrants = Array.isArray(res.data?.data) ? res.data.data : [];

      if (!confirmedRegistrants.length) {
        window.alert("There are no confirmed records to export for this tournament yet.");
        return;
      }

      const rows = buildExportRows(confirmedRegistrants);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();

      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 28 },
        { wch: 18 },
        { wch: 20 },
        { wch: 12 },
        { wch: 22 },
        { wch: 22 },
        { wch: 16 },
        { wch: 24 },
        { wch: 42 },
        { wch: 18 },
        { wch: 30 },
        { wch: 12 },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Confirmed Registrants");

      const fileName = `${sanitizeFileName(currentTournament?.game_name || `tournament-${id}`)}-confirmed-registrants.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error(err);
      window.alert("Unable to export confirmed records right now.");
    } finally {
      exportConfirmedBtn.disabled = false;
      exportConfirmedBtn.textContent = defaultLabel;
    }
  };

  const renderTournamentInfo = (tournament) => {
    currentTournament = tournament ?? null;

    if (!tournament) {
      tournamentName.textContent = "Tournament unavailable";
      tournamentSubtitle.textContent = "Unable to load tournament details for this page.";
      tournamentIdValue.textContent = String(id);
      tournamentCategory.textContent = "--";
      tournamentPlatforms.innerHTML = '<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">--</span>';
      tournamentTeamSize.textContent = "--";
      tournamentRegFee.textContent = "--";
      tournamentRegEnd.textContent = "--";
      return;
    }

    tournamentName.textContent = tournament.game_name ?? "Unnamed Tournament";
    tournamentSubtitle.textContent = `${tournament.game_category ?? "Uncategorized"} tournament registration records`;
    tournamentIdValue.textContent = String(tournament.id ?? id);
    tournamentCategory.textContent = tournament.game_category ?? "--";
    tournamentTeamSize.textContent = `${tournament.team_size ?? "--"} player${Number(tournament.team_size) === 1 ? "" : "s"}`;
    tournamentRegFee.textContent = formatCurrency(tournament.reg_fee);
    tournamentRegEnd.textContent = formatDate(tournament.reg_end);

    const platforms = Array.isArray(tournament.platforms) ? tournament.platforms : [];
    tournamentPlatforms.innerHTML = platforms.length
      ? platforms
          .map(
            (platform) =>
              `<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">${escapeHtml(platform)}</span>`
          )
          .join("")
      : '<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">--</span>';
  };

  const renderRows = (registrants) => {
    clearSelection();
    tableBody.innerHTML = "";

    if (!registrants.length) {
      const hasSearch = !!searchInput?.value?.trim();
      renderEmptyState(hasSearch ? "No registrants match your search." : "No registrants found for this filter.");
      return;
    }

    registrants.forEach((registrant) => {
      const teamName = registrant.team_name?.trim() || "—";
      const playersHtml = (registrant.players ?? [])
        .map(
          (player) =>
            `<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">${escapeHtml(player)}</span>`
        )
        .join("");

      const isConfirmed = !!registrant.reg_confirmed;
      const row = document.createElement("tr");

      row.id = String(registrant.registration_id);
      row.className = "cursor-pointer transition hover:bg-white/5 [&>td]:px-5 [&>td]:py-4";

      row.innerHTML = `
        <td class="font-semibold text-white/90">${escapeHtml(teamName)}</td>

        <td class="text-white/80">
          <div class="flex flex-wrap gap-2">${playersHtml}</div>
        </td>

        <td class="whitespace-nowrap text-white/80">+592 ${escapeHtml(registrant.number ?? "")}</td>

        <td class="whitespace-nowrap text-white/80">
          <a
            class="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
            href="mailto:${escapeHtml(registrant.email ?? "")}"
          >
            ${escapeHtml(registrant.email ?? "")}
          </a>
        </td>

        <td class="whitespace-nowrap">
          <select
            data-confirm-select="1"
            data-registration-id="${registrant.registration_id}"
            data-prev="${isConfirmed ? "true" : "false"}"
            class="w-full min-w-[190px] cursor-pointer rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white/90 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
          >
            <option value="false" class="bg-zinc-900" ${!isConfirmed ? "selected" : ""}>Not Confirmed</option>
            <option value="true" class="bg-zinc-900" ${isConfirmed ? "selected" : ""}>Confirmed</option>
          </select>
        </td>
      `;

      tableBody.appendChild(row);
    });
  };

  const getVisibleRegistrants = () => {
    const queryRaw = searchInput?.value?.trim() ?? "";
    const query = queryRaw.toLowerCase();
    const digitsOnlyQuery = queryRaw.replace(/\D/g, "");

    if (!query) return [...allRegistrants];

    return allRegistrants.filter((registrant) => {
      const teamName = String(registrant.team_name ?? "").toLowerCase();
      const email = String(registrant.email ?? "").toLowerCase();
      const phone = String(registrant.number ?? "");
      const phoneDigits = phone.replace(/\D/g, "");
      const players = Array.isArray(registrant.players)
        ? registrant.players.join(" ").toLowerCase()
        : "";

      return (
        teamName.includes(query) ||
        email.includes(query) ||
        players.includes(query) ||
        phone.includes(queryRaw) ||
        (!!digitsOnlyQuery && phoneDigits.includes(digitsOnlyQuery))
      );
    });
  };

  const applyFiltersAndRender = () => {
    const visibleRegistrants = getVisibleRegistrants();
    renderRows(visibleRegistrants);
    setResultsMeta(visibleRegistrants.length, allRegistrants.length);

    if (clearSearchBtn) {
      clearSearchBtn.classList.toggle("hidden", !searchInput?.value?.trim());
    }
  };

  const loadTournamentInfo = async () => {
    try {
      const res = await axios.get("/2026/api/get-tournament", {
        params: { id },
      });

      const tournament = Array.isArray(res.data?.data) ? res.data.data[0] : null;
      renderTournamentInfo(tournament);
    } catch (err) {
      console.error(err);
      renderTournamentInfo(null);
    }
  };

  const loadRegistrants = async (filter = null) => {
    currentFilter = filter;
    setActiveFilterButton(filter);
    setLoading(true);

    try {
      const res = await axios.get("/adminPanel/tournaments/api/registrants", {
        params: {
          id,
          ...(filter === null ? {} : { confirmed: filter }),
        },
      });

      allRegistrants = Array.isArray(res.data?.data) ? res.data.data : [];
      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
      allRegistrants = [];
      renderEmptyState("Unable to load registrants right now.");
      setResultsMeta(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const closeConfirmModal = ({ revert = true } = {}) => {
    if (revert && pendingConfirmation?.select) {
      pendingConfirmation.select.value = pendingConfirmation.prevValue ? "true" : "false";
    }

    pendingConfirmation = null;
    confirmModal.classList.add("hidden");
    confirmModal.classList.remove("flex");
    confirmModalActionBtn.disabled = false;
    confirmModalActionBtn.textContent = "Confirm Registration";
  };

  const openConfirmModal = ({ select, registrationId, prevValue, newValue }) => {
    const registrant = allRegistrants.find((item) => Number(item.registration_id) === Number(registrationId));
    const label = registrant?.team_name?.trim() || registrant?.email || "this registration";

    pendingConfirmation = { select, registrationId, prevValue, newValue };
    confirmModalText.textContent = `${label} will be marked as confirmed.`;
    confirmModal.classList.remove("hidden");
    confirmModal.classList.add("flex");
  };

  const updateConfirmation = async ({ registrationId, newValue, prevValue, select }) => {
    select.disabled = true;

    try {
      await axios.patch("/adminPanel/tournaments/api/registrants/confirmation", {
        registrationId,
        reg_confirmed: newValue,
      });

      select.dataset.prev = newValue ? "true" : "false";
      await loadRegistrants(currentFilter);
    } catch (err) {
      console.error(err);
      select.value = prevValue ? "true" : "false";
    } finally {
      select.disabled = false;
    }
  };

  if (confirmedBtn) {
    confirmedBtn.addEventListener("click", () => {
      const nextFilter = currentFilter === true ? null : true;
      loadRegistrants(nextFilter);
    });
  }

  if (notConfirmedBtn) {
    notConfirmedBtn.addEventListener("click", () => {
      const nextFilter = currentFilter === false ? null : false;
      loadRegistrants(nextFilter);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFiltersAndRender);
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = "";
      applyFiltersAndRender();
      searchInput.focus();
    });
  }

  tableBody.addEventListener("click", (e) => {
    const clickedSelect = e.target.closest("select[data-confirm-select]");
    const clickedLink = e.target.closest("a");
    if (clickedSelect || clickedLink) return;

    const row = e.target.closest("tr");
    if (!row || !row.id) return;

    const regId = Number(row.id);
    if (!regId) return;

    if (selectedRegistrationId === regId) {
      clearSelection();
      return;
    }

    if (selectedRowEl) selectedRowEl.classList.remove("bg-white/10");

    selectedRegistrationId = regId;
    selectedRowEl = row;
    row.classList.add("bg-white/10");
    setDeleteEnabled(true);
  });

  if (exportConfirmedBtn) {
    exportConfirmedBtn.addEventListener("click", exportConfirmedRegistrants);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!selectedRegistrationId) return;

      const ok = window.confirm("Delete this registrant? This cannot be undone.");
      if (!ok) return;

      deleteBtn.disabled = true;

      try {
        await axios.delete(`/adminPanel/tournaments/api/registrants/${selectedRegistrationId}`);
        clearSelection();
        await loadRegistrants(currentFilter);
      } catch (err) {
        console.error(err);
        setDeleteEnabled(!!selectedRegistrationId);
      }
    });
  }

  tableBody.addEventListener("change", async (e) => {
    const select = e.target.closest("select[data-confirm-select]");
    if (!select) return;

    const registrationId = Number(select.dataset.registrationId);
    const newValue = select.value === "true";
    const prevValue = select.dataset.prev === "true";

    if (newValue === prevValue) return;

    if (newValue) {
      openConfirmModal({ select, registrationId, prevValue, newValue });
      return;
    }

    await updateConfirmation({ registrationId, newValue, prevValue, select });
  });

  if (cancelConfirmModalBtn) {
    cancelConfirmModalBtn.addEventListener("click", () => closeConfirmModal({ revert: true }));
  }

  if (confirmModalActionBtn) {
    confirmModalActionBtn.addEventListener("click", async () => {
      if (!pendingConfirmation) return;

      const { registrationId, newValue, prevValue, select } = pendingConfirmation;
      confirmModalActionBtn.disabled = true;
      confirmModalActionBtn.textContent = "Updating...";

      try {
        await updateConfirmation({ registrationId, newValue, prevValue, select });
        closeConfirmModal({ revert: false });
      } catch (err) {
        console.error(err);
        closeConfirmModal({ revert: true });
      }
    });
  }

  if (confirmModal) {
    confirmModal.addEventListener("click", (e) => {
      if (e.target === confirmModal) {
        closeConfirmModal({ revert: true });
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pendingConfirmation) {
      closeConfirmModal({ revert: true });
    }
  });

  Promise.allSettled([loadTournamentInfo(), loadRegistrants(null)]);
});
