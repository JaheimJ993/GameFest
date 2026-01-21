const carousel = document.getElementById("carousel");
  const scrollLeft = document.getElementById("scrollLeft");
  const scrollRight = document.getElementById("scrollRight");

  scrollLeft.addEventListener("click", () => {
    carousel.scrollBy({ left: -300, behavior: "smooth" });
  });

  scrollRight.addEventListener("click", () => {
    carousel.scrollBy({ left: 300, behavior: "smooth" });
  });