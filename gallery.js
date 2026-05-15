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
    }
}

// Render gallery grid with lazy loading for performance
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    grid.innerHTML = galleryData.map((item, index) => `
        <div class="gallery-item fade-in group cursor-pointer" data-index="${index}">
            <div class="relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 bg-gray-100">
                <img 
                    data-src="${item.src}" 
                    alt="${item.alt || 'Kafé na Kopci - ' + item.category}" 
                    class="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500 lazy"
                    loading="lazy"
                    width="400"
                    height="256"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p class="text-white font-semibold">${item.alt || ''}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    // Lazy load images using Intersection Observer (Core Web Vitals optimization)
    const lazyImages = document.querySelectorAll('img.lazy');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before image enters viewport
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // Add click listeners for lightbox
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            openLightbox(index);
        });
    });
    
    observeElements();
}

// Lightbox functionality
function openLightbox(index) {
    currentImageIndex = index;
    const item = galleryData[index];
    
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    
    if (lightbox && img) {
        img.src = item.src;
        img.alt = item.alt || 'Kafé na Kopci';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryData.length;
    openLightbox(currentImageIndex);
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryData.length) % galleryData.length;
    openLightbox(currentImageIndex);
}

// Fade-in on scroll observer
function observeElements() {
    const fadeElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    fadeElements.forEach(el => fadeObserver.observe(el));
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    }
});

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    observeElements();
    
    // Lightbox event listeners
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const lightbox = document.getElementById('lightbox');
    
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
});
