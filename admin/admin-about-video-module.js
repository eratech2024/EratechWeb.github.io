// Admin About Video Management Module

let aboutVideoData = {};

// API Base URL
const ABOUT_VIDEO_API_BASE = 'http://localhost:3000';

// Load about video data
async function loadAboutVideoAdmin() {
    // Try to load from API first
    try {
        const response = await fetch(ABOUT_VIDEO_API_BASE + '/api/get-data/about-video');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.aboutVideo) {
                aboutVideoData = result.data.aboutVideo;
                console.log('About video loaded from API');
                displayAboutVideoForm();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('aboutVideoData');
    if (stored) {
        try {
            aboutVideoData = JSON.parse(stored);
            displayAboutVideoForm();
        } catch (e) {
            console.error('Error parsing about video data:', e);
            await loadAboutVideoFromJSON();
        }
    } else {
        await loadAboutVideoFromJSON();
    }
}

// Load from JSON file
async function loadAboutVideoFromJSON() {
    try {
        const response = await fetch('../data/about-video-data.json');
        const data = await response.json();
        aboutVideoData = data.aboutVideo;
        await saveAboutVideo();
        displayAboutVideoForm();
    } catch (error) {
        console.error('Error loading about video:', error);
        aboutVideoData = {
            enabled: true,
            thumbnail: 'images/2. View các hướng_Final.jpg',
            videoUrl: '',
            videoType: 'youtube',
            youtubeId: '',
            title: 'Giới thiệu về ERATECH',
            description: 'Video giới thiệu về công ty'
        };
        displayAboutVideoForm();
    }
}

// Save about video data
async function saveAboutVideo() {
    try {
        const dataStr = JSON.stringify(aboutVideoData);
        
        // Save to server via API
        try {
            const response = await fetch(ABOUT_VIDEO_API_BASE + '/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'about-video',
                    data: { aboutVideo: aboutVideoData }
                })
            });
            const result = await response.json();
            if (result.success) {
                console.log('About video saved to server');
            }
        } catch (apiError) {
            console.warn('API save failed:', apiError.message);
        }
        
        // Also save to localStorage as backup
        localStorage.setItem('aboutVideoData', dataStr);
        return true;
    } catch (e) {
        showAboutVideoAlert('Lỗi khi lưu dữ liệu: ' + e.message, 'error');
        console.error('Save error:', e);
        return false;
    }
}

// Auto export to JSON
function autoExportAboutVideoToJSON() {
    const dataStr = JSON.stringify({ aboutVideo: aboutVideoData }, null, 2);
    console.log('About video JSON ready for export');
}

// Display form with current data
function displayAboutVideoForm() {
    // Set form values
    document.getElementById('about-video-enabled').checked = aboutVideoData.enabled !== false;
    document.getElementById('about-video-display-mode').value = aboutVideoData.displayMode || 'autoplay';
    document.getElementById('about-video-thumbnail').value = aboutVideoData.thumbnail || '';
    document.getElementById('about-video-type').value = aboutVideoData.videoType || 'youtube';
    document.getElementById('about-video-url').value = aboutVideoData.videoUrl || '';
    document.getElementById('about-video-youtube-id').value = aboutVideoData.youtubeId || '';
    document.getElementById('about-video-title').value = aboutVideoData.title || '';
    document.getElementById('about-video-description').value = aboutVideoData.description || '';
    
    // Show/hide fields based on video type and display mode
    toggleAboutVideoTypeFields();
    toggleAboutVideoDisplayMode();
    
    // Show thumbnail preview
    if (aboutVideoData.thumbnail) {
        showAboutVideoThumbnailPreview(aboutVideoData.thumbnail);
    }
}

// Toggle video type fields
function toggleAboutVideoTypeFields() {
    const videoType = document.getElementById('about-video-type').value;
    const urlField = document.getElementById('about-video-url-field');
    const youtubeField = document.getElementById('about-video-youtube-field');
    
    if (videoType === 'youtube') {
        urlField.style.display = 'none';
        youtubeField.style.display = 'block';
    } else {
        urlField.style.display = 'block';
        youtubeField.style.display = 'none';
    }
}

// Toggle display mode fields
function toggleAboutVideoDisplayMode() {
    const displayMode = document.getElementById('about-video-display-mode').value;
    const thumbnailField = document.getElementById('about-video-thumbnail-field');
    
    if (displayMode === 'autoplay') {
        // Autoplay mode - thumbnail is optional (used as fallback)
        thumbnailField.querySelector('label').innerHTML = 'Ảnh dự phòng (fallback)';
        thumbnailField.querySelector('small').innerHTML = 'Ảnh hiển thị khi video không load được (tùy chọn)';
    } else {
        // Click to play mode - thumbnail is required
        thumbnailField.querySelector('label').innerHTML = 'Ảnh thumbnail *';
        thumbnailField.querySelector('small').innerHTML = 'Ảnh hiển thị trước khi phát video (khuyến nghị: 800x600px)';
    }
}

// Handle form submit
async function handleAboutVideoFormSubmit(e) {
    e.preventDefault();
    console.log('About video form submitted');
    
    const videoType = document.getElementById('about-video-type').value;
    const videoUrl = document.getElementById('about-video-url').value;
    const youtubeId = document.getElementById('about-video-youtube-id').value;
    
    // Validate based on type
    if (videoType === 'youtube' && !youtubeId.trim()) {
        showAboutVideoAlert('Vui lòng nhập YouTube Video ID!', 'error');
        return;
    }
    
    if (videoType === 'direct' && !videoUrl.trim()) {
        showAboutVideoAlert('Vui lòng nhập đường dẫn video!', 'error');
        return;
    }
    
    aboutVideoData = {
        enabled: document.getElementById('about-video-enabled').checked,
        displayMode: document.getElementById('about-video-display-mode').value,
        thumbnail: document.getElementById('about-video-thumbnail').value,
        videoType: videoType,
        videoUrl: videoUrl,
        youtubeId: youtubeId,
        title: document.getElementById('about-video-title').value,
        description: document.getElementById('about-video-description').value
    };
    
    const saved = await saveAboutVideo();
    
    if (saved) {
        showAboutVideoAlert('Cập nhật video thành công!', 'success');
    }
}

// Show alert
function showAboutVideoAlert(message, type = 'success') {
    const container = document.getElementById('about-video-alert-container');
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

// Handle thumbnail upload - Upload to server
async function handleAboutVideoThumbnailUpload(event) {
    // Prevent any default behavior
    if (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    }
    
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showAboutVideoAlert('Vui lòng chọn file hình ảnh!', 'error');
            return;
        }
        
        if (file.size > 15 * 1024 * 1024) {
            showAboutVideoAlert('Kích thước ảnh không được vượt quá 15MB!', 'error');
            return;
        }
        
        showAboutVideoAlert('Đang xử lý và upload ảnh lên server...', 'success');
        const compressedData = await compressImage(file, 800, 0.7);
        
        // Upload to server
        if (typeof uploadImageToServer === 'function') {
            const uploadResult = await uploadImageToServer(compressedData, 'about');
            
            if (uploadResult.success) {
                document.getElementById('about-video-thumbnail').value = uploadResult.path;
                showAboutVideoThumbnailPreview(uploadResult.path);
                showAboutVideoAlert(`Đã upload ảnh lên server: ${uploadResult.path}`, 'success');
            } else {
                document.getElementById('about-video-thumbnail').value = compressedData;
                showAboutVideoThumbnailPreview(compressedData);
                showAboutVideoAlert('Upload server thất bại, đã lưu dạng base64', 'error');
            }
        } else {
            document.getElementById('about-video-thumbnail').value = compressedData;
            showAboutVideoThumbnailPreview(compressedData);
            const sizeKB = (compressedData.length * 0.75 / 1024).toFixed(0);
            showAboutVideoAlert(`Đã tải ảnh (${sizeKB}KB)`, 'success');
        }
    } catch (error) {
        showAboutVideoAlert('Lỗi khi xử lý ảnh: ' + error.message, 'error');
    }
}

// Show thumbnail preview
function showAboutVideoThumbnailPreview(imagePath) {
    if (!imagePath) return;
    
    const previewDiv = document.getElementById('about-video-thumbnail-preview');
    const previewImg = document.getElementById('about-video-thumbnail-img');
    
    if (previewDiv && previewImg) {
        previewImg.src = imagePath;
        previewDiv.style.display = 'block';
    }
}

// Export about video data
function exportAboutVideoData() {
    const dataStr = JSON.stringify({ aboutVideo: aboutVideoData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'about-video-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showAboutVideoAlert('Đã xuất dữ liệu thành công!');
}

// Initialize on window load
window.addEventListener('load', function() {
    // Register form submit handler
    const aboutVideoForm = document.getElementById('about-video-form');
    if (aboutVideoForm) {
        aboutVideoForm.addEventListener('submit', handleAboutVideoFormSubmit);
        console.log('About video form handler registered');
    }
    
    // Register video type change handler
    const videoTypeSelect = document.getElementById('about-video-type');
    if (videoTypeSelect) {
        videoTypeSelect.addEventListener('change', toggleAboutVideoTypeFields);
    }
    
    // Register display mode change handler
    const displayModeSelect = document.getElementById('about-video-display-mode');
    if (displayModeSelect) {
        displayModeSelect.addEventListener('change', toggleAboutVideoDisplayMode);
    }
    
    // Load data
    loadAboutVideoAdmin();
});
