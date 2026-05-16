// Gallery data - will be loaded from JSON file
let galleryData = [];
let currentImageIndex = 0;

// Load gallery data
async function loadGallery() {
    try {
        const response = await fetch('gallery-data.json');
        galleryData = await response.json();
        
        // Update paths to use optimized folder
        galleryData = galleryData.map(item => ({
            ...item,
            src: item.src.replace('images/', 'images/optimized/'),
            webp: item.src.replace('images/', 'images/optimized/').replace(/\.(jpg|jpeg)/i, '.webp')
        }));
        
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

// Render gallery grid
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    galleryData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item group';
        div.innerHTML = `
            <picture>
                <source srcset="${item.webp}" type="image/webp">
                <img src="${item.src}" alt="${item.caption}" loading="lazy" 
                     class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
            </picture>
            <div class="gallery-caption">
                <p class="text-sm">${item.caption}</p>
            </div>
        `;
        div.addEventListener('click', () => openLightbox(index));
        grid.appendChild(div);
    });
}

// Open lightbox
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = lightbox.querySelector('img');
    const item = galleryData[currentImageIndex];
    
    // Use WebP if supported, otherwise JPEG
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    img.src = supportsWebP ? item.webp : item.src;
    
    lightbox.classList.add('active');
}

// Close lightbox
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
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
