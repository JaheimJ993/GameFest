const galleryButton = document.getElementById("openGallery");
const galleryScreen = document.getElementById("galleryDiv");
const closeGallery = document.getElementById("closeGallery");
const photoGallery = document.getElementById("photo-gallery");

const openGallery = () => {
    galleryScreen.classList.toggle("hidden")
    galleryScreen.scrollTop = 0;
    galleryDiv.scrollIntoView({ behavior: "smooth", block: "start" });

}


galleryButton.addEventListener("click", ()=>{
    openGallery();
})

closeGallery.addEventListener("click", ()=> {
    galleryScreen.classList.add("hidden");
    
})