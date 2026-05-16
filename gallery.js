// Gallery data - will be loaded from JSON file
let galleryData = [];
let currentImageIndex = 0;

// Load gallery data
async function loadGallery() {
    try {
        const response = await fetch('gallery-data.json');
        galleryData = await response.json();
        
        // Paths already include optimized/ in gallery-data.json
        
        renderGallery();
    } catch (error) {
        console.error('Error loading gallery:', error);
        loadDemoGallery();
    }
}

// Demo gallery for initial setup
function loadDemoGallery() {
    galleryData = [
        { id: 1, src: 'images/optimized/demo1.jpg', webp: 'images/optimized/demo1.webp', caption: 'Naše kavárna' }
    ];
    renderGallery();
}

// Open lightbox
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const item = galleryData[currentImageIndex];
    
    if (item) {
        img.src = item.src;
        caption.textContent = item.alt || 'Kafé na Kopci';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }
}

// Close lightbox
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

// Navigate lightbox
function navigateLightbox(direction) {
    currentImageIndex = (currentImageIndex + direction + galleryData.length) % galleryData.length;
    openLightbox(currentImageIndex);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
});

// Initialize
document.addEventListener('DOMContentLoaded', loadGallery);
