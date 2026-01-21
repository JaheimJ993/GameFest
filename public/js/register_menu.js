document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".collapsible-toggle");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const target = document.getElementById(targetId);

      if (!target) return;

      const isOpen = !target.classList.contains("hidden");

      // Optionally: Close all other open sections
      document.querySelectorAll(".collapsible-content").forEach((el) => {
        el.classList.add("hidden");
      });

      // Toggle current section
      if (!isOpen) {
        target.classList.remove("hidden");
      }
    });
  });
});
