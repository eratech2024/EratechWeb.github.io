// Admin Hero Banner Management Module

let heroBanners = [];
let heroBannerSettings = {
    slideDuration: 5,
    animationType: 'fade'
};
let editingBannerId = null;

// Hàm mở file dialog - tạo input động để tránh mọi vấn đề với form
function openBannerFileDialog() {
    console.log('openBannerFileDialog called');
    
    // Xóa input cũ nếu có
    const oldInput = document.getElementById('banner-file-upload-dynamic');
    if (oldInput) {
        oldInput.remove();
    }
    
    // Tạo input mới
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'banner-file-upload-dynamic';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    // Thêm vào body (không phải form)
    document.body.appendChild(input);
    
    // Xử lý khi chọn file
    input.onchange = function(e) {
        console.log('File selected');
        processBannerFile(e.target.files[0]);
        // Xóa input sau khi xử lý
        setTimeout(function() {
            input.remove();
        }, 100);
    };
    
    // Mở dialog
    input.click();
}

// Xử lý file ảnh banner
function processBannerFile(file) {
    console.log('processBannerFile called');
    
    if (!file) {
        console.log('No file');
        return;
    }
    
    console.log('File:', file.name, file.size, file.type);
    
    if (!file.type.startsWith('image/')) {
        showHeroBannerAlert('Vui lòng chọn file ảnh!', 'error');
        return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
        showHeroBannerAlert('Kích thước ảnh không được vượt quá 15MB!', 'error');
        return;
    }
    
    showHeroBannerAlert('Đang xử lý ảnh...', 'success');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // Compress image
            const canvas = document.createElement('canvas');
            const targetWidth = 1920;
            const targetHeight = 800;
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            
            const imgAspect = img.width / img.height;
            const canvasAspect = targetWidth / targetHeight;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgAspect > canvasAspect) {
                drawHeight = targetHeight;
                drawWidth = img.width * (targetHeight / img.height);
                offsetX = (targetWidth - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = targetWidth;
                drawHeight = img.height * (targetWidth / img.width);
                offsetX = 0;
                offsetY = (targetHeight - drawHeight) / 2;
            }
            
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            
            const compressedData = canvas.toDataURL('image/jpeg', 0.85);
            
            // Set values
            document.getElementById('banner-image').value = compressedData;
            document.getElementById('banner-preview-img').src = compressedData;
            document.getElementById('banner-image-preview').style.display = 'block';
            
            const sizeKB = Math.round(compressedData.length * 0.75 / 1024);
            showHeroBannerAlert('Đã tải ảnh thành công! (' + sizeKB + 'KB)', 'success');
            
            console.log('Banner image processed successfully');
        };
        
        img.onerror = function() {
            showHeroBannerAlert('Không thể đọc file ảnh!', 'error');
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        showHeroBannerAlert('Không thể đọc file!', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Danh sách các trang có thể setup banner
const PAGE_LIST = [
    { id: 'home', name: 'Trang chủ', file: 'index.html' },
    { id: 'about', name: 'Giới thiệu', file: 'about.html' },
    { id: 'services', name: 'Dịch vụ', file: 'services.html' },
    { id: 'projects', name: 'Dự án', file: 'projects.html' },
    { id: 'investment', name: 'Đầu tư', file: 'investment.html' },
    { id: 'customers', name: 'Khách hàng', file: 'customers.html' },
    { id: 'news', name: 'Tin tức', file: 'news.html' },
    { id: 'contact', name: 'Liên hệ', file: 'contact.html' },
    { id: 'recruitment', name: 'Tuyển dụng', file: 'recruitment.html' },
    { id: 'certificates', name: 'Chứng chỉ', file: 'certificates.html' },
    { id: 'team', name: 'Đội ngũ', file: 'team.html' },
    { id: 'research', name: 'R&D', file: 'research-development.html' },
    { id: 'mission', name: 'Sứ mệnh', file: 'mission-vision-values.html' }
];

// Current selected page for filtering
let currentPageFilter = 'all';

// API Base URL - Node.js server
const API_BASE = 'http://localhost:3000';

// Load hero banners from JSON file
async function loadHeroBanners() {
    try {
        const response = await fetch(API_BASE + '/api/get-data/hero-banner');
        if (!response.ok) {
            throw new Error('Failed to load banner data');
        }
        const result = await response.json();
        const data = result.data || { banners: [], settings: { slideDuration: 5, animationType: 'fade' } };
        heroBanners = data.banners || [];
        heroBannerSettings = data.settings || { slideDuration: 5, animationType: 'fade' };
        
        localStorage.setItem('heroBannerData', JSON.stringify(data));
    } catch (e) {
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem('heroBannerData');
        if (stored) {
            const data = JSON.parse(stored);
            heroBanners = data.banners || [];
            heroBannerSettings = data.settings || { slideDuration: 5, animationType: 'fade' };
        } else {
            heroBanners = [];
            heroBannerSettings = { slideDuration: 5, animationType: 'fade' };
        }
    }
    
    // Load settings into form
    document.getElementById('hero-slide-duration').value = heroBannerSettings.slideDuration;
    document.getElementById('hero-animation-type').value = heroBannerSettings.animationType;
    
    displayHeroBannerList();
}

// Save hero banners to JSON file via API
async function saveHeroBanners() {
    try {
        const data = {
            banners: heroBanners,
            settings: heroBannerSettings
        };
        
        // Save to server via API (Node.js)
        const response = await fetch(API_BASE + '/api/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'hero-banner',
                data: data
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to save data');
        }
        
        localStorage.setItem('heroBannerData', JSON.stringify(data));
        return true;
    } catch (e) {
        showHeroBannerAlert('Lỗi khi lưu dữ liệu: ' + e.message, 'error');
        return false;
    }
}

// Save settings only
async function saveHeroBannerSettings() {
    heroBannerSettings.slideDuration = parseInt(document.getElementById('hero-slide-duration').value) || 5;
    heroBannerSettings.animationType = document.getElementById('hero-animation-type').value || 'fade';
    
    const saved = await saveHeroBanners();
    if (saved) {
        showHeroBannerAlert('Đã lưu cài đặt thành công!', 'success');
    }
}

// Display banner list
function displayHeroBannerList() {
    const container = document.getElementById('hero-banner-list');
    if (!container) return;
    
    // Filter banners by page if selected
    let filteredBanners = heroBanners;
    if (currentPageFilter !== 'all') {
        filteredBanners = heroBanners.filter(b => 
            !b.pages || b.pages.length === 0 || b.pages.includes(currentPageFilter)
        );
    }
    
    if (filteredBanners.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; border: 2px dashed #1f7332;">
                <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 20px; color: #1f7332; opacity: 0.7;"></i>
                <h3 style="color: #1f7332; margin-bottom: 15px; font-size: 1.5rem;">Chưa có banner nào${currentPageFilter !== 'all' ? ' cho trang này' : ''}</h3>
                <p style="color: #666; margin-bottom: 25px; font-size: 1rem;">Nhấn "Thêm Banner" để bắt đầu.</p>
                
                <div style="background: white; padding: 25px; border-radius: 10px; margin-top: 20px; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <h4 style="color: #1f7332; margin-bottom: 15px; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-info-circle"></i>
                        Kích thước ảnh khuyến nghị
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 12px 15px; background: #e8f5e9; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #1f7332; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #333;">
                                <i class="fas fa-star" style="color: #ffc107; margin-right: 8px;"></i>
                                Khuyến nghị:
                            </span>
                            <span style="color: #1f7332; font-family: monospace; font-weight: bold;">1920 x 800 px (tỷ lệ 2.4:1)</span>
                        </li>
                        <li style="padding: 12px 15px; background: #f8f9fa; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #1f7332; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #333;">
                                <i class="fas fa-desktop" style="color: #1f7332; margin-right: 8px;"></i>
                                Desktop Full:
                            </span>
                            <span style="color: #666; font-family: monospace;">1920 x 1080 px (16:9)</span>
                        </li>
                        <li style="padding: 12px 15px; background: #f8f9fa; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #1f7332; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #333;">
                                <i class="fas fa-expand-arrows-alt" style="color: #1f7332; margin-right: 8px;"></i>
                                Wide Banner:
                            </span>
                            <span style="color: #666; font-family: monospace;">1920 x 600 px (3.2:1)</span>
                        </li>
                    </ul>
                    <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <p style="margin: 0 0 10px 0; color: #1565c0; font-size: 0.9rem; line-height: 1.6;">
                            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                            <strong>Tỷ lệ khung hình:</strong>
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #1565c0; font-size: 0.85rem;">
                            <li><strong>2.4:1</strong> - Banner chuẩn website (khuyến nghị)</li>
                            <li><strong>16:9</strong> - Full HD, hiển thị nhiều nội dung</li>
                            <li><strong>3:1 hoặc 4:1</strong> - Banner mỏng, tập trung vào text</li>
                        </ul>
                    </div>
                    <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; color: #856404; font-size: 0.9rem; line-height: 1.6;">
                            <i class="fas fa-lightbulb" style="margin-right: 8px;"></i>
                            <strong>Lưu ý:</strong> Định dạng JPG, PNG, WebP. Ảnh sẽ tự động scale về 1920x800px khi upload. Hero section sẽ tự điều chỉnh chiều cao theo tỷ lệ hình ảnh.
                        </p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const sortedBanners = [...filteredBanners].sort((a, b) => a.order - b.order);
    
    // Helper function to get page names
    const getPageNames = (pages) => {
        if (!pages || pages.length === 0) return 'Tất cả trang';
        return pages.map(p => {
            const page = PAGE_LIST.find(pl => pl.id === p);
            return page ? page.name : p;
        }).join(', ');
    };
    
    container.innerHTML = sortedBanners.map(banner => `
        <div class="hero-banner-item" style="display: flex; gap: 15px; padding: 15px; background: white; border: 1px solid #e8e8e8; border-radius: 10px; margin-bottom: 10px; align-items: center; opacity: ${banner.active ? '1' : '0.5'};">
            <div style="width: 150px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #f0f0f0;">
                <img src="${banner.image}" alt="${banner.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 150 80%22><rect fill=%22%23ddd%22 width=%22150%22 height=%2280%22/><text x=%2275%22 y=%2245%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>'">
            </div>
            <div style="flex: 1; min-width: 0;">
                <h4 style="font-size: 0.95rem; font-weight: 600; color: #333; margin-bottom: 5px;">${banner.title || '(Không có tiêu đề)'}</h4>
                <p style="font-size: 0.8rem; color: #666; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${banner.subtitle || '(Không có nội dung)'}</p>
                <div style="display: flex; gap: 10px; font-size: 0.75rem; color: #888; flex-wrap: wrap;">
                    <span><i class="fas fa-sort"></i> #${banner.order}</span>
                    <span><i class="fas fa-align-${banner.textPosition || 'center'}"></i> ${banner.textPosition === 'left' ? 'Trái' : banner.textPosition === 'right' ? 'Phải' : 'Giữa'}</span>
                    <span><i class="fas fa-file-alt"></i> ${getPageNames(banner.pages)}</span>
                    <span class="badge ${banner.active ? 'badge-active' : 'badge-inactive'}">${banner.active ? 'Hiển thị' : 'Ẩn'}</span>
                </div>
            </div>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                <button class="btn btn-sm btn-edit" onclick="editHeroBanner(${banner.id})" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteHeroBanner(${banner.id})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-hide" onclick="toggleHeroBannerActive(${banner.id})" title="${banner.active ? 'Ẩn' : 'Hiện'}">
                    <i class="fas fa-${banner.active ? 'eye-slash' : 'eye'}"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Filter banners by page
function filterBannersByPage(pageId) {
    currentPageFilter = pageId;
    displayHeroBannerList();
}

// Initialize page filter dropdown
function initPageFilter() {
    const filterContainer = document.getElementById('banner-page-filter');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = `
        <select id="page-filter-select" onchange="filterBannersByPage(this.value)" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
            <option value="all">Tất cả trang</option>
            ${PAGE_LIST.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
    `;
}

// Show alert
function showHeroBannerAlert(message, type = 'success') {
    const container = document.getElementById('hero-banner-alert');
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    
    setTimeout(() => { container.innerHTML = ''; }, 3000);
}

// Show add banner form
function showAddBannerForm() {
    editingBannerId = null;
    document.getElementById('banner-form-title').innerHTML = '<i class="fas fa-plus-circle"></i> Thêm Banner Mới';
    document.getElementById('hero-banner-form').reset();
    document.getElementById('banner-order').value = heroBanners.length + 1;
    document.getElementById('banner-active').checked = true;
    document.getElementById('banner-image-preview').style.display = 'none';
    
    // Reset all checkboxes, then check current filter page if any
    setSelectedPages(currentPageFilter !== 'all' ? [currentPageFilter] : []);
    
    document.getElementById('hero-banner-form-container').style.display = 'block';
    document.getElementById('hero-banner-form-container').scrollIntoView({ behavior: 'smooth' });
}

// Hide add banner form
function hideAddBannerForm() {
    document.getElementById('hero-banner-form-container').style.display = 'none';
    editingBannerId = null;
}

// Handle form submit
function handleHeroBannerFormSubmit(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    try {
        const image = document.getElementById('banner-image').value;
        if (!image) {
            showHeroBannerAlert('Vui lòng chọn ảnh banner!', 'error');
            return false;
        }
        
        // Get selected pages from checkboxes
        const selectedPages = getSelectedPages();
        
        const bannerData = {
            id: editingBannerId || Date.now(),
            image: image,
            title: document.getElementById('banner-title').value,
            subtitle: document.getElementById('banner-subtitle').value,
            order: parseInt(document.getElementById('banner-order').value) || 1,
            textPosition: document.getElementById('banner-text-position').value,
            active: document.getElementById('banner-active').checked,
            pages: selectedPages // Thêm danh sách trang áp dụng
        };
        
        if (editingBannerId) {
            const index = heroBanners.findIndex(b => b.id === editingBannerId);
            if (index !== -1) {
                heroBanners[index] = bannerData;
            }
            showHeroBannerAlert('Đã cập nhật banner thành công!', 'success');
        } else {
            heroBanners.push(bannerData);
            showHeroBannerAlert('Đã thêm banner mới thành công!', 'success');
        }
        
        saveHeroBanners();
        displayHeroBannerList();
        hideAddBannerForm();
    } catch (error) {
        console.error('Form submit error:', error);
        showHeroBannerAlert('Lỗi khi lưu: ' + error.message, 'error');
    }
    
    return false;
}

// Edit banner
function editHeroBanner(id) {
    const banner = heroBanners.find(b => b.id === id);
    if (!banner) return;
    
    editingBannerId = id;
    document.getElementById('banner-form-title').innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa Banner';
    document.getElementById('banner-id').value = id;
    document.getElementById('banner-image').value = banner.image;
    document.getElementById('banner-title').value = banner.title || '';
    document.getElementById('banner-subtitle').value = banner.subtitle || '';
    document.getElementById('banner-order').value = banner.order || 1;
    document.getElementById('banner-text-position').value = banner.textPosition || 'center';
    document.getElementById('banner-active').checked = banner.active !== false;
    
    // Set selected pages in checkboxes
    setSelectedPages(banner.pages || []);
    
    // Show preview
    if (banner.image) {
        document.getElementById('banner-preview-img').src = banner.image;
        document.getElementById('banner-image-preview').style.display = 'block';
    }
    
    document.getElementById('hero-banner-form-container').style.display = 'block';
    document.getElementById('hero-banner-form-container').scrollIntoView({ behavior: 'smooth' });
}

// Delete banner
function deleteHeroBanner(id) {
    const banner = heroBanners.find(b => b.id === id);
    if (!banner) return;
    
    if (!confirm(`Bạn có chắc muốn xóa banner này?`)) return;
    
    heroBanners = heroBanners.filter(b => b.id !== id);
    saveHeroBanners();
    displayHeroBannerList();
    showHeroBannerAlert('Đã xóa banner thành công!', 'success');
}

// Toggle active
function toggleHeroBannerActive(id) {
    const banner = heroBanners.find(b => b.id === id);
    if (!banner) return;
    
    banner.active = !banner.active;
    saveHeroBanners();
    displayHeroBannerList();
    showHeroBannerAlert(`Đã ${banner.active ? 'hiển thị' : 'ẩn'} banner!`, 'success');
}

// Compress and scale image to COVER banner dimensions (fill entire area)
function compressBannerImage(file, targetWidth = 1920, targetHeight = 800, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                
                // Set canvas to target banner size
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                
                const ctx = canvas.getContext('2d');
                
                // Calculate scale to COVER (fill entire canvas, crop excess)
                const imgAspect = img.width / img.height;
                const canvasAspect = targetWidth / targetHeight;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (imgAspect > canvasAspect) {
                    // Image is wider than canvas - fit height, crop width
                    drawHeight = targetHeight;
                    drawWidth = img.width * (targetHeight / img.height);
                    offsetX = (targetWidth - drawWidth) / 2;
                    offsetY = 0;
                } else {
                    // Image is taller than canvas - fit width, crop height
                    drawWidth = targetWidth;
                    drawHeight = img.height * (targetWidth / img.width);
                    offsetX = 0;
                    offsetY = (targetHeight - drawHeight) / 2;
                }
                
                // Draw image centered and covering entire canvas
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Handle image upload - Simple version without server upload
function handleBannerImageUpload(event) {
    console.log('=== handleBannerImageUpload START ===');
    
    // Prevent any default behavior
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const files = event.target.files;
    if (!files || files.length === 0) {
        console.log('No file selected');
        return false;
    }
    
    const file = files[0];
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    if (!file.type.startsWith('image/')) {
        showHeroBannerAlert('Vui lòng chọn file ảnh!', 'error');
        return false;
    }
    
    if (file.size > 15 * 1024 * 1024) {
        showHeroBannerAlert('Kích thước ảnh không được vượt quá 15MB!', 'error');
        return false;
    }
    
    showHeroBannerAlert('Đang xử lý ảnh...', 'success');
    
    // Use FileReader to read image
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('FileReader loaded');
        const img = new Image();
        
        img.onload = function() {
            console.log('Image loaded:', img.width, 'x', img.height);
            
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            const targetWidth = 1920;
            const targetHeight = 800;
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            
            // Calculate scale to cover
            const imgAspect = img.width / img.height;
            const canvasAspect = targetWidth / targetHeight;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgAspect > canvasAspect) {
                drawHeight = targetHeight;
                drawWidth = img.width * (targetHeight / img.height);
                offsetX = (targetWidth - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = targetWidth;
                drawHeight = img.height * (targetWidth / img.width);
                offsetX = 0;
                offsetY = (targetHeight - drawHeight) / 2;
            }
            
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            
            const compressedData = canvas.toDataURL('image/jpeg', 0.85);
            console.log('Image compressed, size:', compressedData.length);
            
            // Set values
            document.getElementById('banner-image').value = compressedData;
            document.getElementById('banner-preview-img').src = compressedData;
            document.getElementById('banner-image-preview').style.display = 'block';
            
            const sizeKB = (compressedData.length * 0.75 / 1024).toFixed(0);
            showHeroBannerAlert('Đã tải ảnh thành công! (' + sizeKB + 'KB)', 'success');
            
            console.log('=== handleBannerImageUpload COMPLETE ===');
        };
        
        img.onerror = function() {
            console.error('Image load error');
            showHeroBannerAlert('Không thể đọc file ảnh!', 'error');
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        console.error('FileReader error');
        showHeroBannerAlert('Không thể đọc file!', 'error');
    };
    
    reader.readAsDataURL(file);
    
    return false;
}

// Export banner data
function exportHeroBannerData() {
    const data = {
        banners: heroBanners,
        settings: heroBannerSettings
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hero-banner-data.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Initialize page checkboxes in form
function initPageSelect() {
    const container = document.getElementById('banner-page-checkboxes');
    if (!container) return;
    
    container.innerHTML = PAGE_LIST.map(p => `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #ddd; transition: all 0.2s;">
            <input type="checkbox" name="banner-page" value="${p.id}" style="width: 16px; height: 16px; cursor: pointer;">
            <span style="font-size: 13px;">${p.name}</span>
        </label>
    `).join('');
}

// Get selected pages from checkboxes
function getSelectedPages() {
    const checkboxes = document.querySelectorAll('input[name="banner-page"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Set selected pages in checkboxes
function setSelectedPages(pages) {
    const checkboxes = document.querySelectorAll('input[name="banner-page"]');
    checkboxes.forEach(cb => {
        cb.checked = pages && pages.includes(cb.value);
    });
}

// Initialize
window.addEventListener('load', function() {
    console.log('Hero Banner Module loaded');
    initPageFilter();
    initPageSelect();
    loadHeroBanners();
});
