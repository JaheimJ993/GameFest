document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("photo-gallery");

  fetch("/api/gallery/2025")
    .then(res => res.json())
    .then(images => {
      images.forEach(filename => {
        const img = document.createElement("img");
        img.src = `/images/2025/GameFest-Day/${filename}`;
        img.alt = "Gallery image";
        img.className = "rounded-lg shadow-md object-cover w-full h-64 hover:scale-105 transition-transform duration-300 hover:cursor-pointer";
        gallery.appendChild(img);
      });
    })
    .catch(err => console.error("Error loading gallery:", err));
});


