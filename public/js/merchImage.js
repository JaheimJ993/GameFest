document.addEventListener("DOMContentLoaded", () => {
  const mainImage = document.getElementById("mainImage");
  const imageButtons = document.querySelectorAll("#smallImages button");

  imageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const thumbImg = btn.querySelector("img");
      if (!thumbImg) return;

      mainImage.src = thumbImg.src;
      mainImage.alt = thumbImg.alt || "Merch image";
    });
  });
});
