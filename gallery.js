// Gallery data - will be loaded from JSON file
let galleryData = [];
let currentImageIndex = 0;

// Load gallery data
async function loadGallery() {
    try {
        const response = await fetch('gallery-data.json');
        galleryData = await response.json();
        renderGallery();
    } catch (error) {
        console.error('Error loading gallery:', error);
        // Fallback to demo data if file doesn't exist
        loadDemoGallery();
    }
}

// Demo gallery for initial setup
function loadDemoGallery() {
    galleryData = [
        { id: 1, src: 'images/demo1.jpg', caption: 'Naše kavárna', order: 1 },
        { id: 2, src: 'images/demo2.jpg', caption: 'Čerstvé zákusky', order: 2 },
        { id: 3, src: 'images/demo3.jpg', caption: 'Domácí dorty', order: 3 },
        { id: 4, src: 'images/demo4.jpg', caption: 'Výhled z kavárny', order: 4 }
    ];
    renderGallery();
}

// Render gallery grid
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Sort by order
    const sorted = [...galleryData].sort((a, b) => a.order - b.order);
    
    sorted.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item rounded-lg overflow-hidden shadow-lg';
        div.innerHTML = `
            <img src="${item.src}" alt="${item.caption}" loading="lazy">
            <div class="gallery-caption">
                <p class="text-sm font-semibold">${item.caption}</p>
            </div>
        `;
        
        div.addEventListener('click', () => openLightbox(index));
        grid.appendChild(div);
    });
}

// Lightbox functionality
function openLightbox(index) {
    currentImageIndex = index;
    const sorted = [...galleryData].sort((a, b) => a.order - b.order);
    const item = sorted[index];
    
    document.getElementById('lightbox-img').src = item.src;
    document.getElementById('lightbox-caption').textContent = item.caption;
    document.getElementById('lightbox').classList.add('active');
    
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function nextImage() {
    const sorted = [...galleryData].sort((a, b) => a.order - b.order);
    currentImageIndex = (currentImageIndex + 1) % sorted.length;
    openLightbox(currentImageIndex);
}

function prevImage() {
    const sorted = [...galleryData].sort((a, b) => a.order - b.order);
    currentImageIndex = (currentImageIndex - 1 + sorted.length) % sorted.length;
    openLightbox(currentImageIndex);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    document.getElementById('lightbox-next')?.addEventListener('click', nextImage);
    document.getElementById('lightbox-prev')?.addEventListener('click', prevImage);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('lightbox').classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    });
    
    // Close on background click
    document.getElementById('lightbox')?.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });
});
