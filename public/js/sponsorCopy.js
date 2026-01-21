const modal = document.getElementById("presentationModal");
const openBtn = document.getElementById("openPresentation");
const closeBtn = document.getElementById("closePresentation");

const lockBodyScroll = () => {
  const scrollY = window.scrollY;
  document.body.dataset.scrollY = String(scrollY);

  document.body.classList.add("overflow-hidden");
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
};

const unlockBodyScroll = () => {
  const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);

  document.body.classList.remove("overflow-hidden");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";

  window.scrollTo(0, scrollY);
  delete document.body.dataset.scrollY;
};

const openModal = () => {
  modal.classList.remove("hidden");
  lockBodyScroll();
};

const closeModal = () => {
  modal.classList.add("hidden");
  unlockBodyScroll();
};

openBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);

// Optional: click backdrop to close
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Optional: ESC to close
window.addEventListener("keydown", (e) => {
  if (!modal?.classList.contains("hidden") && e.key === "Escape") closeModal();
});
