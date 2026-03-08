// Delegate click for all images inside the gallery and winners section

function setupImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const closeModal = document.getElementById('closeModal');
    // Select images in gallery and winner cards
    const gallery = document.getElementById('photo-gallery');
    const winnerImages = document.querySelectorAll('#winners img');

    function showModal(src, alt) {
        modalImg.src = src;
        modalImg.alt = alt || '';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.add('hidden');
        modalImg.src = '';
        document.body.style.overflow = '';
    }

    // Gallery images (may be loaded dynamically)
    if (gallery) {
        gallery.addEventListener('click', function (e) {
            if (e.target.tagName === 'IMG') {
                showModal(e.target.src, e.target.alt);
            }
        });
    }

    // Winner images
    winnerImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => showModal(img.src, img.alt));
    });

    closeModal.addEventListener('click', hideModal);

    // Close on background click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) hideModal();
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
        if (!modal.classList.contains('hidden') && e.key === 'Escape') hideModal();
    });
}
document.addEventListener('DOMContentLoaded', setupImageModal);