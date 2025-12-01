// Admin Hero Media Management Module

let heroMediaItems = [];
let editingHeroId = null;

// API Base URL
const HERO_MEDIA_API_BASE = 'http://localhost:3000';

// Load hero media from API or localStorage
async function loadHeroMediaAdmin() {
    // Try to load from API first
    try {
        const response = await fetch(HERO_MEDIA_API_BASE + '/api/get-data/hero-media');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.heroMedia) {
                heroMediaItems = result.data.heroMedia;
                console.log('Hero media loaded from API');
                displayHeroMediaList();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('heroMediaData');
    if (stored) {
        heroMediaItems = JSON.parse(stored);
    } else {
        // Load from JSON file on first load
        try {
            const response = await fetch('../data/hero-media-data.json');
            const data = await response.json();
            heroMediaItems = data.heroMedia;
            await saveHeroMedia();
        } catch (error) {
            console.error('Error loading hero media:', error);
            heroMediaItems = [];
        }
    }
    displayHeroMediaList();
}

// Save hero media to server and localStorage
async function saveHeroMedia() {
    try {
        const dataStr = JSON.stringify(heroMediaItems);
        
        const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
        console.log(`Hero media data size: ${sizeInMB.toFixed(2)} MB`);
        
        // Save to server via API
        try {
            const response = await fetch(HERO_MEDIA_API_BASE + '/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'hero-media',
                    data: { heroMedia: heroMediaItems }
                })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Hero media saved to server');
            }
        } catch (apiError) {
            console.warn('API save failed:', apiError.message);
        }
        
        // Also save to localStorage as backup (if not too large)
        if (sizeInMB <= 4) {
            localStorage.setItem('heroMediaData', dataStr);
        }
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showHeroAlert('Lỗi: LocalStorage đã đầy! Dữ liệu đã được lưu lên server.', 'error');
            console.error('LocalStorage quota exceeded');
        } else {
            showHeroAlert('Lỗi khi lưu dữ liệu: ' + e.message, 'error');
            console.error('Save error:', e);
        }
        return false;
    }
}

// Auto export to JSON
function autoExportHeroMediaToJSON() {
    const dataStr = JSON.stringify({ heroMedia: heroMediaItems }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hero-media-data.json';
    URL.revokeObjectURL(url);
    console.log('Hero media JSON data ready for export');
}

// Display hero media list - Compact Design
function displayHeroMediaList() {
    const container = document.getElementById('hero-media-container');
    
    if (!container) {
        console.error('Hero media container not found');
        return;
    }
    
    // Update count in new header
    const countEl = document.getElementById('hero-count');
    if (countEl) {
        countEl.textContent = `${heroMediaItems.length} media`;
    }
    
    if (heroMediaItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>Chưa có media nào</p>
                <button class="btn btn-primary" onclick="document.querySelector('.menu-item[data-tab=\\'hero-new\\']').click()">
                    <i class="fas fa-plus"></i> Thêm media
                </button>
            </div>
        `;
        return;
    }
    
    // Sort by order
    const sortedMedia = [...heroMediaItems].sort((a, b) => a.order - b.order);
    
    container.innerHTML = sortedMedia.map(media => `
        <div class="hero-media-item" style="opacity: ${media.active ? '1' : '0.5'}">
            ${media.type === 'video' ? 
                `<video src="${media.src}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;" muted></video>` :
                `<img src="${media.src}" alt="${media.alt}">`
            }
            <div class="hero-media-info">
                <h4>${media.title}</h4>
                <div class="meta">
                    <span><i class="fas fa-${media.type === 'video' ? 'video' : 'image'}"></i> ${media.type === 'video' ? 'Video' : 'Ảnh'}</span>
                    <span><i class="fas fa-sort"></i> #${media.order}</span>
                    <span class="badge ${media.active ? 'badge-active' : 'badge-inactive'}">
                        ${media.active ? 'Hiển thị' : 'Ẩn'}
                    </span>
                </div>
            </div>
            <div class="hero-media-actions">
                <button class="btn btn-sm btn-edit" onclick="editHeroMedia(${media.id})" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteHeroMedia(${media.id})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-hide" onclick="toggleHeroMediaActive(${media.id})" title="${media.active ? 'Ẩn' : 'Hiện'}">
                    <i class="fas fa-${media.active ? 'eye-slash' : 'eye'}"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Show alert for hero media
function showHeroAlert(message, type = 'success') {
    const container = document.getElementById('hero-alert-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// Handle hero media form submit
async function handleHeroMediaFormSubmit(e) {
    e.preventDefault();
    console.log('Hero media form submitted!');
    
    const type = document.getElementById('hero-type').value;
    const src = document.getElementById('hero-src').value;
    
    if (!src || src.trim() === '') {
        showHeroAlert('Vui lòng nhập đường dẫn hoặc chọn file!', 'error');
        return;
    }
    
    const formData = {
        id: editingHeroId || Date.now(),
        type: type,
        title: document.getElementById('hero-title').value,
        src: src,
        alt: document.getElementById('hero-alt').value,
        order: parseInt(document.getElementById('hero-order').value) || 1,
        active: document.getElementById('hero-active').checked
    };
    
    if (editingHeroId) {
        // Update existing
        const index = heroMediaItems.findIndex(m => m.id === editingHeroId);
        if (index !== -1) {
            heroMediaItems[index] = formData;
        }
    } else {
        // Add new
        heroMediaItems.push(formData);
    }
    
    const saved = await saveHeroMedia();
    
    if (!saved) {
        if (editingHeroId) {
            await loadHeroMediaAdmin();
        } else {
            heroMediaItems.pop();
        }
        return;
    }
    
    displayHeroMediaList();
    resetHeroMediaForm();
    
    if (editingHeroId) {
        showHeroAlert('Cập nhật media thành công!', 'success');
    } else {
        showHeroAlert('Thêm media mới thành công!', 'success');
    }
    
    document.querySelector('.menu-item[data-tab="hero-list"]').click();
}

// Edit hero media
function editHeroMedia(id) {
    const media = heroMediaItems.find(m => m.id === id);
    if (!media) {
        console.error('Media not found:', id);
        return;
    }
    
    console.log('Editing media:', media);
    
    editingHeroId = id;
    
    document.querySelector('.menu-item[data-tab="hero-new"]').click();
    
    setTimeout(() => {
        const formTitle = document.getElementById('hero-form-title');
        if (formTitle) {
            formTitle.textContent = 'Chỉnh sửa Media Hero';
        }
        
        document.getElementById('hero-type').value = media.type || 'image';
        document.getElementById('hero-title').value = media.title || '';
        document.getElementById('hero-src').value = media.src || '';
        document.getElementById('hero-alt').value = media.alt || '';
        document.getElementById('hero-order').value = media.order || 1;
        document.getElementById('hero-active').checked = media.active !== false;
        
        // Show preview
        showHeroMediaPreview(media.src, media.type);
        
        showHeroAlert(`Đang chỉnh sửa: "${media.title}"`, 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
}

// Delete hero media
async function deleteHeroMedia(id) {
    const media = heroMediaItems.find(m => m.id === id);
    if (!media) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa media "${media.title}"?\n\nHành động này không thể hoàn tác!`)) return;
    
    heroMediaItems = heroMediaItems.filter(m => m.id !== id);
    await saveHeroMedia();
    displayHeroMediaList();
    
    showHeroAlert(`Đã xóa media "${media.title}" thành công!`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle active status
async function toggleHeroMediaActive(id) {
    const media = heroMediaItems.find(m => m.id === id);
    if (!media) return;
    
    media.active = !media.active;
    await saveHeroMedia();
    displayHeroMediaList();
    
    showHeroAlert(`Đã ${media.active ? 'hiển thị' : 'ẩn'} media "${media.title}"!`, 'success');
}

// Reset form
function resetHeroMediaForm() {
    editingHeroId = null;
    document.getElementById('hero-form-title').textContent = 'Thêm Media Hero Mới';
    document.getElementById('hero-media-form').reset();
    document.getElementById('hero-order').value = heroMediaItems.length + 1;
    document.getElementById('hero-active').checked = true;
    
    // Hide preview
    document.getElementById('hero-media-preview').style.display = 'none';
    document.getElementById('hero-file-upload').value = '';
}

// Handle file upload for hero media - Upload to server
async function handleHeroMediaUpload(event) {
    // Prevent any default behavior
    if (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    }
    
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        const type = document.getElementById('hero-type').value;
        
        // Validate file type
        if (type === 'image' && !file.type.startsWith('image/')) {
            showHeroAlert('Vui lòng chọn file hình ảnh!', 'error');
            return;
        }
        
        if (type === 'video' && !file.type.startsWith('video/')) {
            showHeroAlert('Vui lòng chọn file video!', 'error');
            return;
        }
        
        // Check file size
        const maxSize = type === 'video' ? 50 : 15; // 50MB for video, 15MB for image
        if (file.size > maxSize * 1024 * 1024) {
            showHeroAlert(`Kích thước file không được vượt quá ${maxSize}MB!`, 'error');
            return;
        }
        
        showHeroAlert('Đang xử lý và upload file lên server...', 'success');
        
        if (type === 'image') {
            // Compress image
            const compressedData = await compressImage(file, 1920, 0.8);
            
            // Upload to server
            if (typeof uploadImageToServer === 'function') {
                const uploadResult = await uploadImageToServer(compressedData, 'hero');
                
                if (uploadResult.success) {
                    document.getElementById('hero-src').value = uploadResult.path;
                    showHeroMediaPreview(uploadResult.path, 'image');
                    showHeroAlert(`Đã upload ảnh lên server: ${uploadResult.path}`, 'success');
                } else {
                    document.getElementById('hero-src').value = compressedData;
                    showHeroMediaPreview(compressedData, 'image');
                    showHeroAlert('Upload server thất bại, đã lưu dạng base64', 'error');
                }
            } else {
                document.getElementById('hero-src').value = compressedData;
                showHeroMediaPreview(compressedData, 'image');
                const sizeKB = (compressedData.length * 0.75 / 1024).toFixed(0);
                showHeroAlert(`Đã tải ảnh (${sizeKB}KB)`, 'success');
            }
        } else {
            // For video, recommend using URL instead
            const reader = new FileReader();
            reader.onload = function(e) {
                const videoData = e.target.result;
                document.getElementById('hero-src').value = videoData;
                showHeroMediaPreview(videoData, 'video');
                
                const sizeMB = (videoData.length * 0.75 / (1024 * 1024)).toFixed(2);
                showHeroAlert(`Đã tải video (${sizeMB}MB). Khuyến nghị: Sử dụng đường dẫn video từ thư mục videos/ để tối ưu.`, 'success');
            };
            reader.readAsDataURL(file);
        }
    } catch (error) {
        showHeroAlert('Lỗi khi xử lý file: ' + error.message, 'error');
    }
}

// Show media preview
function showHeroMediaPreview(src, type) {
    if (!src) return;
    
    const previewDiv = document.getElementById('hero-media-preview');
    const previewContent = document.getElementById('hero-preview-content');
    
    if (type === 'video') {
        previewContent.innerHTML = `
            <video src="${src}" controls style="max-width: 100%; max-height: 300px; border-radius: 8px;">
                Trình duyệt không hỗ trợ video.
            </video>
        `;
    } else {
        previewContent.innerHTML = `
            <img src="${src}" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
        `;
    }
    
    previewDiv.style.display = 'block';
}

// Export hero media data
function exportHeroMediaData() {
    const dataStr = JSON.stringify({ heroMedia: heroMediaItems }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hero-media-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showHeroAlert('Đã xuất dữ liệu thành công!');
}

// Initialize on window load
window.addEventListener('load', function() {
    // Register hero media form submit handler
    const heroForm = document.getElementById('hero-media-form');
    if (heroForm) {
        heroForm.addEventListener('submit', handleHeroMediaFormSubmit);
        console.log('Hero media form handler registered');
    }
    
    // Register cancel button
    const heroCancelBtn = document.getElementById('hero-cancel-btn');
    if (heroCancelBtn) {
        heroCancelBtn.addEventListener('click', function() {
            resetHeroMediaForm();
            document.querySelector('.menu-item[data-tab="hero-list"]').click();
        });
    }
    
    // Set default order value
    const orderInput = document.getElementById('hero-order');
    if (orderInput && !orderInput.value) {
        orderInput.value = 1;
    }
    
    // Load hero media data
    loadHeroMediaAdmin();
});
