// GitHub Configuration
const GITHUB_CONFIG = {
    owner: 'caganekdavid-ux',
    repo: 'kafe-na-kopci',
    branch: 'main',
    dataFile: 'gallery-data.json'
};

// Admin credentials
const ADMIN_EMAIL = 'adstosova@gmail.com';
const ADMIN_PASSWORD_HASH = 'bcaf4ef118733f2037292d4e63ceed90f02d546f9aacf1e304c6b2ebbfa1d390'; // SHA-256 of "kafenakopci2026"
const TOKEN_HEX = '0c09163a60260961240e010608680207607e47010e35082e1a5b0c2a1c3a3650205d5f0969250104';
const TOKEN_KEY = 'kafe-na-kopci-2026-secret-key';

// Decode token helper
function decodeToken(hex, key) {
    let decoded = '';
    for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16) ^ key.charCodeAt((i / 2) % key.length);
        decoded += String.fromCharCode(charCode);
    }
    return decoded;
}

// State
let githubToken = '';
let galleryData = [];
let draggedElement = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const photoUpload = document.getElementById('photoUpload');
const photoAlt = document.getElementById('photoAlt');
const photoCategory = document.getElementById('photoCategory');
const uploadPreview = document.getElementById('uploadPreview');
const previewImg = document.getElementById('previewImg');
const previewSize = document.getElementById('previewSize');
const uploadBtn = document.getElementById('uploadBtn');
const galleryGrid = document.getElementById('galleryGrid');
const photoCount = document.getElementById('photoCount');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Utility: SHA-256 hash
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utility: Show loading
function showLoading(text = 'Nahrávám...') {
    loadingText.textContent = text;
    loading.classList.add('active');
}

// Utility: Hide loading
function hideLoading() {
    loading.classList.remove('active');
}

// Utility: Compress image
function compressImage(file, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize if too large (max 1920px wide)
                const maxWidth = 1920;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    // Validate email
    if (email !== ADMIN_EMAIL) {
        loginError.textContent = 'Nesprávný email!';
        loginError.classList.remove('hidden');
        return;
    }
    
    // Validate password
    const passwordHash = await sha256(password);
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
        loginError.textContent = 'Nesprávné heslo!';
        loginError.classList.remove('hidden');
        return;
    }
    
    // Decode GitHub token
    githubToken = decodeToken(TOKEN_HEX, TOKEN_KEY);
    
    // Test token by loading gallery data
    showLoading('Načítám galerii...');
    try {
        await loadGalleryData();
        loginScreen.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        renderGallery();
        hideLoading();
    } catch (error) {
        hideLoading();
        loginError.textContent = 'Chyba při načítání dat. Zkontroluj token.';
        loginError.classList.remove('hidden');
        console.error(error);
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    if (confirm('Opravdu se chceš odhlásit?')) {
        githubToken = '';
        galleryData = [];
        adminPanel.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        loginForm.reset();
    }
});

// Load gallery data from GitHub
async function loadGalleryData() {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to load gallery data');
    }
    
    const data = await response.json();
    const content = atob(data.content);
    galleryData = JSON.parse(content);
    
    return data.sha; // Return SHA for updates
}

// Render gallery
function renderGallery() {
    photoCount.textContent = galleryData.length;
    
    galleryGrid.innerHTML = galleryData.map((photo, index) => `
        <div class="photo-item bg-white rounded-lg shadow-md overflow-hidden" data-index="${index}" draggable="true">
            <img src="../${photo.src}" alt="${photo.alt}" class="w-full h-48 object-cover">
            <div class="p-3">
                <input 
                    type="text" 
                    value="${photo.alt}" 
                    class="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-2 alt-input"
                    data-index="${index}"
                />
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">${photo.category}</span>
                    <button class="text-red-600 hover:text-red-800 text-sm font-semibold delete-btn" data-index="${index}">
                        Smazat
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
    
    document.querySelectorAll('.alt-input').forEach(input => {
        input.addEventListener('change', handleAltChange);
    });
    
    // Drag and drop
    document.querySelectorAll('.photo-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

// Handle alt text change
async function handleAltChange(e) {
    const index = parseInt(e.target.dataset.index);
    const newAlt = e.target.value;
    
    galleryData[index].alt = newAlt;
    
    showLoading('Ukládám změny...');
    try {
        await saveGalleryData('Update photo alt text');
        hideLoading();
    } catch (error) {
        hideLoading();
        alert('Chyba při ukládání: ' + error.message);
    }
}

// Handle delete
async function handleDelete(e) {
    const index = parseInt(e.target.dataset.index);
    const photo = galleryData[index];
    
    if (!confirm(`Smazat fotku: ${photo.alt}?`)) return;
    
    showLoading('Mažu fotografii...');
    
    try {
        // Remove from array
        galleryData.splice(index, 1);
        
        // Save updated gallery data
        await saveGalleryData(`Delete photo: ${photo.alt}`);
        
        // Note: We don't delete the actual image file from images/optimized/
        // because GitHub API requires file SHA, and we'd need to track that.
        // Old images will just remain unused.
        
        renderGallery();
        hideLoading();
    } catch (error) {
        hideLoading();
        alert('Chyba při mazání: ' + error.message);
    }
}

// Drag and drop handlers
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const fromIndex = parseInt(draggedElement.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        // Reorder array
        const item = galleryData.splice(fromIndex, 1)[0];
        galleryData.splice(toIndex, 0, item);
        
        // Save and re-render
        saveGalleryData('Reorder photos').then(() => {
            renderGallery();
        });
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

// Refresh button
refreshBtn.addEventListener('click', async () => {
    showLoading('Načítám...');
    try {
        await loadGalleryData();
        renderGallery();
        hideLoading();
    } catch (error) {
        hideLoading();
        alert('Chyba při načítání: ' + error.message);
    }
});

// Photo upload preview
photoUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    showLoading('Kompresuji náhled...');
    
    try {
        const compressed = await compressImage(file);
        const url = URL.createObjectURL(compressed);
        
        previewImg.src = url;
        previewSize.textContent = `Původní: ${(file.size / 1024).toFixed(0)} KB → Komprimováno: ${(compressed.size / 1024).toFixed(0)} KB`;
        uploadPreview.classList.remove('hidden');
        uploadBtn.disabled = false;
        
        hideLoading();
    } catch (error) {
        hideLoading();
        alert('Chyba při kompresi: ' + error.message);
    }
});

// Upload button
uploadBtn.addEventListener('click', async () => {
    const file = photoUpload.files[0];
    if (!file) return;
    
    const alt = photoAlt.value.trim() || 'Kafé na Kopci';
    const category = photoCategory.value;
    
    showLoading('Kompresuji a nahrávám...');
    
    try {
        // Compress image
        const compressed = await compressImage(file);
        
        // Generate filename
        const timestamp = Date.now();
        const filename = `photo-${timestamp}.jpg`;
        const path = `images/optimized/${filename}`;
        
        // Convert blob to base64
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.readAsDataURL(compressed);
        });
        
        // Upload to GitHub
        showLoading('Nahrávám na GitHub...');
        const uploadUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
        
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add new photo: ${filename}`,
                content: base64,
                branch: GITHUB_CONFIG.branch
            })
        });
        
        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
        }
        
        // Add to gallery data
        galleryData.push({
            src: path,
            alt: alt,
            category: category
        });
        
        // Save gallery data
        showLoading('Aktualizuji galerii...');
        await saveGalleryData(`Add photo: ${filename}`);
        
        // Reset form
        photoUpload.value = '';
        photoAlt.value = 'Kafé na Kopci';
        uploadPreview.classList.add('hidden');
        uploadBtn.disabled = true;
        
        // Re-render
        renderGallery();
        hideLoading();
        
        alert('Fotka úspěšně nahrána! Za 1-2 minuty bude viditelná na webu.');
        
    } catch (error) {
        hideLoading();
        alert('Chyba při nahrávání: ' + error.message);
        console.error(error);
    }
});

// Save gallery data to GitHub
async function saveGalleryData(commitMessage = 'Update gallery') {
    // First, get current file SHA
    const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;
    
    const getResponse = await fetch(getUrl, {
        headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!getResponse.ok) {
        throw new Error('Failed to get current file SHA');
    }
    
    const currentFile = await getResponse.json();
    
    // Update file
    const content = JSON.stringify(galleryData, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    
    const updateUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;
    
    const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: commitMessage,
            content: base64Content,
            sha: currentFile.sha,
            branch: GITHUB_CONFIG.branch
        })
    });
    
    if (!updateResponse.ok) {
        throw new Error('Failed to update gallery data');
    }
    
    return updateResponse.json();
}
