const initApp = () => {
  // NEW header id
  const hamburgerBtn = document.getElementById("hamburgerBtn");

  const mobileMenu = document.getElementById("mobile-menu");
  const footer = document.getElementById("page-footer");

  const openIcon = document.getElementById("openMobileMenu");
  const closeIcon = document.getElementById("closeMenu");

  if (!hamburgerBtn || !mobileMenu) return;

  const toggleMenu = (forceOpen) => {
    const isHidden = mobileMenu.classList.contains("hidden");
    const shouldOpen = forceOpen ?? isHidden;

    // menu show/hide
    mobileMenu.classList.toggle("hidden", !shouldOpen);
    mobileMenu.classList.toggle("flex", shouldOpen);

    // footer show/hide (only if it exists)
    if (footer) footer.classList.toggle("hidden", shouldOpen);

    // lock scroll
    document.body.classList.toggle("overflow-hidden", shouldOpen);

    // swap icons (if they exist)
    if (openIcon) openIcon.classList.toggle("hidden", shouldOpen);
    if (closeIcon) closeIcon.classList.toggle("hidden", !shouldOpen);
  };

  hamburgerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });

  // close when clicking inside menu EXCEPT archives button / dropdown area
  mobileMenu.addEventListener("click", (e) => {
    const archivesBtn = e.target.closest("#Archives-mobile");
    const dropdownArea = e.target.closest("#dropdown-mobile");
    if (!archivesBtn && !dropdownArea) toggleMenu(false);
  });

  // Desktop dropdown
  const archives = document.getElementById("Archives");
  const dropdown = document.getElementById("dropdown");

  const animateDropdown = () => dropdown?.classList.toggle("hidden");

  if (archives && dropdown) {
    archives.addEventListener("mouseover", animateDropdown);

    window.addEventListener("mouseover", (e) => {
      if (!archives.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  // Mobile dropdown
  const archivesMobile = document.getElementById("Archives-mobile");
  const dropdownMobile = document.getElementById("dropdown-mobile");

  const animateDropdownMobile = () => dropdownMobile?.classList.toggle("hidden");

  if (archivesMobile && dropdownMobile) {
    archivesMobile.addEventListener("click", (e) => {
      e.preventDefault();
      animateDropdownMobile();
    });

    window.addEventListener("click", (e) => {
      if (!archivesMobile.contains(e.target) && !dropdownMobile.contains(e.target)) {
        dropdownMobile.classList.add("hidden");
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", initApp);
