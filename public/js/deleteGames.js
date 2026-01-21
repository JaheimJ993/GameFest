document.addEventListener("DOMContentLoaded", () => {
  const deleteModal = document.getElementById("Delete-div");
  const deleteGame = document.getElementById("delProceed");
  const deleteCancel = document.getElementById("delCancel");

  // Handle click on any delete button (event delegation)
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const gameId = e.target.getAttribute("data-id");
      deleteModal.classList.remove("hidden");
      deleteModal.dataset.gameId = gameId; // Store the ID in modal
      console.log("Game to delete:", gameId);
    }
  });

  // Handle cancel button
  deleteCancel.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
    deleteModal.removeAttribute("data-game-id");
  });

  // Handle confirm delete button
  deleteGame.addEventListener("click", async () => {
    const gameId = deleteModal.dataset.gameId;
    if (!gameId) return;

    try {
      // Replace with your backend delete route
      const response = await axios.delete(`/admin/dashboard/manage-games/games/${gameId}`);
      console.log(response)

      // Remove row from DOM
      const rowToDelete = document.getElementById(gameId);
      if (rowToDelete) rowToDelete.remove();

      // Hide modal and clear data
      deleteModal.classList.add("hidden");
      deleteModal.removeAttribute("data-game-id");

      console.log(`Deleted game with ID: ${gameId}`);

      location.reload();
    } catch (error) {
      console.error("Failed to delete game:", error);
      // Optionally show an error message
    }
  });
});
