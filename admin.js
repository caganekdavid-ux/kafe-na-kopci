// Admin Panel JavaScript
let galleryData = [];
let pendingUploads = [];
let editingImageId = null;

// Load gallery data
async function loadGalleryData() {
    try {
        const response = await fetch('gallery-data.json');
        galleryData = await response.json();
    } catch (error) {
        console.log('No existing gallery data, starting fresh');
        galleryData = [];
    }
    updateStats();
    renderAdminGallery();
}

// Update statistics
function updateStats() {
    document.getElementById('total-images').textContent = galleryData.length;
    
    // Calculate approximate size (rough estimate based on file count)
    const estimatedSize = (galleryData.length * 0.5).toFixed(1);
    document.getElementById('gallery-size').textContent = `~${estimatedSize} MB`;
    
    if (galleryData.length > 0) {
        const lastUpdate = new Date().toLocaleDateString('cs-CZ');
        document.getElementById('last-updated').textContent = lastUpdate;
    }
}

// Render admin gallery
function renderAdminGallery() {
    const container = document.getElementById('admin-gallery');
    const emptyState = document.getElementById('empty-state');
    
    if (galleryData.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    container.innerHTML = '';
    
    // Sort by order
    const sorted = [...galleryData].sort((a, b) => a.order - b.order);
    
    sorted.forEach(item => {
        const div = document.createElement('div');
        div.className = 'bg-white border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition';
        div.setAttribute('data-id', item.id);
        
        div.innerHTML = `
            <div class="relative">
                <img src="${item.src}" alt="${item.caption}" class="w-full h-48 object-cover">
                <div class="drag-handle absolute top-2 left-2 bg-white bg-opacity-90 rounded-full p-2 cursor-move">
                    <i class="fas fa-grip-vertical text-gray-600"></i>
                </div>
            </div>
            <div class="p-4">
                <p class="text-sm text-gray-700 mb-3 font-medium">${item.caption || 'Bez popisku'}</p>
                <div class="flex gap-2">
                    <button onclick="editCaption(${item.id})" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition">
                        <i class="fas fa-pencil-alt mr-1"></i>Upravit
                    </button>
                    <button onclick="deleteImage(${item.id})" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition">
                        <i class="fas fa-trash mr-1"></i>Smazat
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
    
    // Initialize SortableJS
    if (window.Sortable && galleryData.length > 1) {
        new Sortable(container, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: function() {
                updateOrder();
            }
        });
    }
}

// Update order after drag & drop
function updateOrder() {
    const container = document.getElementById('admin-gallery');
    const items = container.querySelectorAll('[data-id]');
    
    items.forEach((item, index) => {
        const id = parseInt(item.getAttribute('data-id'));
        const imageData = galleryData.find(img => img.id === id);
        if (imageData) {
            imageData.order = index + 1;
        }
    });
    
    document.getElementById('save-order-btn').classList.remove('hidden');
    showNotification('Pořadí změněno - nezapomeňte uložit!', 'warning');
}

// Save order
function saveOrder() {
    saveGalleryData();
    document.getElementById('save-order-btn').classList.add('hidden');
    showNotification('Pořadí uloženo!', 'success');
}

// Edit caption
function editCaption(id) {
    editingImageId = id;
    const image = galleryData.find(img => img.id === id);
    
    document.getElementById('caption-input').value = image.caption || '';
    document.getElementById('edit-modal').classList.remove('hidden');
}

// Save caption
function saveCaption() {
    const newCaption = document.getElementById('caption-input').value.trim();
    const image = galleryData.find(img => img.id === editingImageId);
    
    if (image) {
        image.caption = newCaption;
        saveGalleryData();
        renderAdminGallery();
        closeEditModal();
        showNotification('Popisek uložen!', 'success');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    editingImageId = null;
}

// Delete image
function deleteImage(id) {
    if (!confirm('Opravdu chcete smazat tuto fotku?')) return;
    
    galleryData = galleryData.filter(img => img.id !== id);
    saveGalleryData();
    renderAdminGallery();
    updateStats();
    showNotification('Fotka smazána', 'success');
}

// File upload handling
document.getElementById('drop-zone').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', handleFileSelect);

document.getElementById('drop-zone').addEventListener('dragover', (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-amber-500', 'bg-amber-50');
});

document.getElementById('drop-zone').addEventListener('dragleave', (e) => {
    e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50');
});

document.getElementById('drop-zone').addEventListener('drop', (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-amber-500', 'bg-amber-50');
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
});

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    pendingUploads = [];
    const preview = document.getElementById('upload-preview');
    preview.innerHTML = '';
    preview.classList.remove('hidden');
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            showNotification(`Soubor ${file.name} je příliš velký (max 10 MB)`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const id = Date.now() + Math.random();
            pendingUploads.push({
                id,
                src: e.target.result,
                caption: file.name.replace(/\.[^/.]+$/, ''),
                order: galleryData.length + pendingUploads.length + 1,
                file: file
            });
            
            const div = document.createElement('div');
            div.className = 'relative group';
            div.innerHTML = `
                <img src="${e.target.result}" class="w-full h-32 object-cover rounded-lg">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                    <button onclick="removePending(${id})" class="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-8 h-8 transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="text-xs text-gray-600 mt-1 truncate">${file.name}</p>
            `;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
    
    document.getElementById('upload-btn').classList.remove('hidden');
}

function removePending(id) {
    pendingUploads = pendingUploads.filter(img => img.id !== id);
    
    if (pendingUploads.length === 0) {
        document.getElementById('upload-preview').classList.add('hidden');
        document.getElementById('upload-btn').classList.add('hidden');
        document.getElementById('file-input').value = '';
    } else {
        // Re-render preview
        const preview = document.getElementById('upload-preview');
        const toRemove = Array.from(preview.children).find(child => 
            child.querySelector('button')?.getAttribute('onclick')?.includes(id)
        );
        if (toRemove) toRemove.remove();
    }
}

// Upload images
document.getElementById('upload-btn').addEventListener('click', () => {
    if (pendingUploads.length === 0) return;
    
    // Add to gallery data
    pendingUploads.forEach(upload => {
        galleryData.push({
            id: upload.id,
            src: upload.src,
            caption: upload.caption,
            order: upload.order
        });
    });
    
    saveGalleryData();
    
    // Reset
    pendingUploads = [];
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('upload-preview').classList.add('hidden');
    document.getElementById('upload-btn').classList.add('hidden');
    document.getElementById('file-input').value = '';
    
    updateStats();
    renderAdminGallery();
    showNotification(`Přidáno ${pendingUploads.length || galleryData.length} fotek!`, 'success');
});

// Save gallery data to JSON
function saveGalleryData() {
    const dataStr = JSON.stringify(galleryData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // In a real app, this would upload to server
    // For now, we'll trigger download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gallery-data.json';
    
    // Also save to localStorage as backup
    localStorage.setItem('galleryData', dataStr);
}

// Export gallery data
document.getElementById('export-btn').addEventListener('click', () => {
    const dataStr = JSON.stringify(galleryData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gallery-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showNotification('Data exportována!', 'success');
});

// Notification system
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadGalleryData();
    
    // Try to load from localStorage first
    const savedData = localStorage.getItem('galleryData');
    if (savedData) {
        try {
            galleryData = JSON.parse(savedData);
            updateStats();
            renderAdminGallery();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
    
    document.getElementById('save-order-btn').addEventListener('click', saveOrder);
    document.getElementById('save-caption-btn').addEventListener('click', saveCaption);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditModal);
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('edit-modal').classList.contains('hidden')) {
            closeEditModal();
        }
    });
});
