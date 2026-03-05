document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("tableContent");
  const loader = document.getElementById("tableLoader");

  const confirmedBtn = document.getElementById("filterConfirmed");
  const notConfirmedBtn = document.getElementById("filterNotConfirmed");
  const deleteBtn = document.getElementById("deleteSelected");

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("tournament-id"));

  // null = all, true = confirmed only, false = not confirmed only
  let currentFilter = null;

  // row selection for delete
  let selectedRegistrationId = null;
  let selectedRowEl = null;

  if (!tableBody) {
    console.error("Missing #tableContent tbody");
    return;
  }

  if (!id) {
    console.error("Missing tournament-id in URL. Example: ?tournament-id=2");
    return;
  }

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

  const renderEmptyState = () => {
    clearSelection();
    tableBody.innerHTML = "";
    const empty = document.createElement("tr");
    empty.className = "[&>td]:px-5 [&>td]:py-8";
    empty.innerHTML = `
      <td colspan="5" class="text-center text-white/60">
        No registrants found for this filter.
      </td>
    `;
    tableBody.appendChild(empty);
  };

  const renderRows = (registrants) => {
    clearSelection();
    tableBody.innerHTML = "";

    if (!registrants.length) {
      renderEmptyState();
      return;
    }

    registrants.forEach((registrant) => {
      const teamName = registrant.team_name ?? "NULL";
      const playersHtml = (registrant.players ?? [])
        .map(
          (player) =>
            `<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">${player}</span>`
        )
        .join("");

      const isConfirmed = !!registrant.reg_confirmed;

      const row = document.createElement("tr");
      row.id = String(registrant.registration_id);
      row.className = "transition hover:bg-white/5 [&>td]:px-5 [&>td]:py-4 cursor-pointer";

      row.innerHTML = `
        <td class="font-semibold text-white/90">${teamName}</td>

        <td class="text-white/80">
          <div class="flex flex-wrap gap-2">${playersHtml}</div>
        </td>

        <td class="whitespace-nowrap text-white/80">+592 ${registrant.number ?? ""}</td>

        <td class="whitespace-nowrap text-white/80">
          <a class="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
             href="mailto:${registrant.email ?? ""}">
            ${registrant.email ?? ""}
          </a>
        </td>

        <td class="whitespace-nowrap">
          <select
            data-confirm-select="1"
            data-registration-id="${registrant.registration_id}"
            data-prev="${isConfirmed ? "true" : "false"}"
            class="w-full min-w-[180px] cursor-pointer rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white/90 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
          >
            <option value="false" class="bg-zinc-900" ${!isConfirmed ? "selected" : ""}>Not Confirmed</option>
            <option value="true" class="bg-zinc-900" ${isConfirmed ? "selected" : ""}>Confirmed</option>
          </select>
        </td>
      `;

      tableBody.appendChild(row);
    });
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

      const registrantData = res.data?.data ?? [];
      renderRows(registrantData);
    } catch (err) {
      console.error(err);
      renderEmptyState();
    } finally {
      setLoading(false);
    }
  };

  // Toggle behavior:
  // - Click Confirmed: if already on confirmed filter -> show all
  // - Click Not Confirmed: if already on not confirmed filter -> show all
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

  // Row selection (ignore clicks on select/link)
  tableBody.addEventListener("click", (e) => {
    const clickedSelect = e.target.closest("select[data-confirm-select]");
    const clickedLink = e.target.closest("a");
    if (clickedSelect || clickedLink) return;

    const row = e.target.closest("tr");
    if (!row || !row.id) return;

    const regId = Number(row.id);
    if (!regId) return; // ignore empty state row

    // toggle off if clicking same row
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

  // Delete selected
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!selectedRegistrationId) return;

      const ok = window.confirm("Delete this registrant? This cannot be undone.");
      if (!ok) return;

      deleteBtn.disabled = true;

      try {
        await axios.delete(`/adminPanel/tournaments/api/registrants/${selectedRegistrationId}`);

        if (selectedRowEl) selectedRowEl.remove();
        clearSelection();

        const remainingDataRows = Array.from(tableBody.querySelectorAll("tr")).filter((tr) => {
          const n = Number(tr.id);
          return !!n;
        });

        if (remainingDataRows.length === 0) {
          renderEmptyState();
        }
      } catch (err) {
        console.error(err);
        setDeleteEnabled(!!selectedRegistrationId);
      }
    });
  }

  // Dropdown -> update DB (event delegation)
  tableBody.addEventListener("change", async (e) => {
    const select = e.target.closest("select[data-confirm-select]");
    if (!select) return;

    const registrationId = Number(select.dataset.registrationId);
    const newValue = select.value === "true";
    const prevValue = select.dataset.prev === "true";

    select.disabled = true;

    try {
      await axios.patch("/adminPanel/tournaments/api/registrants/confirmation", {
        registrationId,
        reg_confirmed: newValue,
      });

      select.dataset.prev = newValue ? "true" : "false";

      // If currently filtered and this row no longer matches, remove it.
      if (currentFilter !== null && newValue !== currentFilter) {
        const row = document.getElementById(String(registrationId));
        if (row) {
          if (selectedRegistrationId === registrationId) clearSelection();
          row.remove();
        }

        const remainingDataRows = Array.from(tableBody.querySelectorAll("tr")).filter((tr) => {
          const n = Number(tr.id);
          return !!n;
        });

        if (remainingDataRows.length === 0) {
          renderEmptyState();
        }
      }
    } catch (err) {
      console.error(err);
      select.value = prevValue ? "true" : "false";
    } finally {
      select.disabled = false;
    }
  });

  // Initial load (all)
  loadRegistrants(null);
});
