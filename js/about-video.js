// About Video Player

let aboutVideoConfig = {};

// API Base URL
const ABOUT_VIDEO_API_BASE = 'http://localhost:3000';

// Load about video configuration
async function loadAboutVideoConfig() {
    // Try to load from API first
    try {
        const response = await fetch(ABOUT_VIDEO_API_BASE + '/api/get-data/about-video');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.aboutVideo) {
                aboutVideoConfig = result.data.aboutVideo;
                console.log('About video loaded from API');
                initializeAboutVideo();
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
            aboutVideoConfig = JSON.parse(stored);
            initializeAboutVideo();
            return;
        } catch (e) {
            console.error('Error parsing about video config:', e);
        }
    }
    
    // Fallback to JSON file
    try {
        const response = await fetch('data/about-video-data.json');
        const data = await response.json();
        aboutVideoConfig = data.aboutVideo;
        initializeAboutVideo();
    } catch (error) {
        console.error('Error loading about video config:', error);
        // Use default config
        aboutVideoConfig = {
            enabled: true,
            displayMode: 'click',
            thumbnail: 'images/2. View các hướng_Final.jpg',
            videoType: 'youtube',
            youtubeId: '',
            videoUrl: '',
            title: 'Giới thiệu về ERATECH',
            description: ''
        };
        initializeAboutVideo();
    }
}

// Initialize about video
function initializeAboutVideo() {
    const videoContainer = document.getElementById('about-video-container');
    const playBtn = document.querySelector('.play-btn[data-video="about"]');
    const aboutImage = document.querySelector('.about-image img');
    const imageContainer = document.querySelector('.about-image .image-container');
    
    // Check if video is enabled
    if (aboutVideoConfig.enabled === false) {
        if (playBtn) playBtn.style.display = 'none';
        return;
    }
    
    // New direct video container
    if (videoContainer) {
        initializeDirectVideo(videoContainer);
        console.log('About video initialized in direct mode');
        return;
    }
    
    // Legacy support for image container
    if (!imageContainer) {
        console.warn('Video container not found');
        return;
    }
    
    // Check display mode
    if (aboutVideoConfig.displayMode === 'autoplay') {
        // Autoplay mode - replace image with video
        initializeAutoplayVideo(imageContainer, aboutImage);
    } else {
        // Click to play mode - show thumbnail with play button
        initializeClickToPlayVideo(playBtn, aboutImage);
    }
    
    console.log('About video initialized in', aboutVideoConfig.displayMode, 'mode');
}

// Initialize direct video display
function initializeDirectVideo(container) {
    let videoElement;
    
    if (aboutVideoConfig.videoType === 'youtube' && aboutVideoConfig.youtubeId) {
        // YouTube embed with autoplay
        videoElement = document.createElement('iframe');
        videoElement.src = `https://www.youtube.com/embed/${aboutVideoConfig.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${aboutVideoConfig.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1`;
        videoElement.width = '100%';
        videoElement.height = '100%';
        videoElement.frameBorder = '0';
        videoElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        videoElement.allowFullscreen = true;
    } else if (aboutVideoConfig.videoType === 'direct' && aboutVideoConfig.videoUrl) {
        // Direct video with autoplay
        videoElement = document.createElement('video');
        videoElement.src = aboutVideoConfig.videoUrl;
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.playsInline = true;
    } else {
        // No video configured - show placeholder
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #1f7332 0%, #2d8b3d 100%); color: white; text-align: center; padding: 40px;">
                <div>
                    <i class="fas fa-video" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.8;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">Video giới thiệu ERATECH</p>
                    <p style="opacity: 0.8; margin-top: 8px; font-size: 0.9rem;">Sắp ra mắt</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.appendChild(videoElement);
}

// Initialize autoplay video
function initializeAutoplayVideo(container, fallbackImage) {
    // Hide play button
    const playBtn = document.querySelector('.play-btn[data-video="about"]');
    if (playBtn) {
        playBtn.style.display = 'none';
    }
    
    // Create video element
    let videoElement;
    
    if (aboutVideoConfig.videoType === 'youtube' && aboutVideoConfig.youtubeId) {
        // YouTube embed with autoplay
        videoElement = document.createElement('iframe');
        videoElement.src = `https://www.youtube.com/embed/${aboutVideoConfig.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${aboutVideoConfig.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1`;
        videoElement.width = '100%';
        videoElement.height = '100%';
        videoElement.frameBorder = '0';
        videoElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        videoElement.allowFullscreen = true;
        videoElement.style.position = 'absolute';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        videoElement.style.borderRadius = '12px';
    } else if (aboutVideoConfig.videoType === 'direct' && aboutVideoConfig.videoUrl) {
        // Direct video with autoplay
        videoElement = document.createElement('video');
        videoElement.src = aboutVideoConfig.videoUrl;
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.playsInline = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        videoElement.style.borderRadius = '12px';
        
        // Handle video load error
        videoElement.onerror = function() {
            console.error('Video failed to load, showing fallback image');
            videoElement.style.display = 'none';
            if (fallbackImage) {
                fallbackImage.style.display = 'block';
            }
        };
    } else {
        // No video configured, keep showing image
        console.warn('No video configured for autoplay mode');
        return;
    }
    
    // Hide original image
    if (fallbackImage) {
        fallbackImage.style.display = 'none';
    }
    
    // Add video to container
    container.style.position = 'relative';
    container.appendChild(videoElement);
}

// Initialize click to play video
function initializeClickToPlayVideo(playBtn, aboutImage) {
    if (!playBtn) {
        console.warn('Play button not found');
        return;
    }
    
    // Update thumbnail if configured
    if (aboutVideoConfig.thumbnail && aboutImage) {
        aboutImage.src = aboutVideoConfig.thumbnail;
    }
    
    // Show play button
    playBtn.style.display = 'flex';
    
    // Add click event to play button
    playBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openVideoModal();
    });
}

// Open video modal
function openVideoModal() {
    // Create modal if not exists
    let modal = document.getElementById('video-modal');
    if (!modal) {
        modal = createVideoModal();
        document.body.appendChild(modal);
    }
    
    // Get video container
    const videoContainer = modal.querySelector('.video-container');
    
    // Clear previous content
    videoContainer.innerHTML = '';
    
    // Create video element based on type
    if (aboutVideoConfig.videoType === 'youtube' && aboutVideoConfig.youtubeId) {
        // YouTube embed
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${aboutVideoConfig.youtubeId}?autoplay=1&rel=0`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        videoContainer.appendChild(iframe);
    } else if (aboutVideoConfig.videoType === 'direct' && aboutVideoConfig.videoUrl) {
        // Direct video
        const video = document.createElement('video');
        video.src = aboutVideoConfig.videoUrl;
        video.controls = true;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        videoContainer.appendChild(video);
    } else {
        // No video configured
        videoContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; padding: 40px;">
                <div>
                    <i class="fas fa-video-slash" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <p style="font-size: 1.2rem;">Video chưa được cấu hình</p>
                    <p style="opacity: 0.7; margin-top: 10px;">Vui lòng liên hệ quản trị viên để thêm video</p>
                </div>
            </div>
        `;
    }
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Create video modal
function createVideoModal() {
    const modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-overlay"></div>
        <div class="video-modal-content">
            <button class="video-modal-close">
                <i class="fas fa-times"></i>
            </button>
            <div class="video-container"></div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .video-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .video-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(5px);
        }
        
        .video-modal-content {
            position: relative;
            width: 90%;
            max-width: 1200px;
            height: 80vh;
            max-height: 675px;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.4s ease;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .video-modal-close {
            position: absolute;
            top: -50px;
            right: 0;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10001;
        }
        
        .video-modal-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }
        
        .video-container {
            width: 100%;
            height: 100%;
            background: #000;
        }
        
        @media (max-width: 768px) {
            .video-modal-content {
                width: 95%;
                height: 70vh;
            }
            
            .video-modal-close {
                top: -45px;
                width: 35px;
                height: 35px;
                font-size: 18px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add close event
    const closeBtn = modal.querySelector('.video-modal-close');
    const overlay = modal.querySelector('.video-modal-overlay');
    
    closeBtn.addEventListener('click', closeVideoModal);
    overlay.addEventListener('click', closeVideoModal);
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeVideoModal();
        }
    });
    
    return modal;
}

// Close video modal
function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    if (!modal) return;
    
    // Stop video
    const videoContainer = modal.querySelector('.video-container');
    videoContainer.innerHTML = '';
    
    // Hide modal
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAboutVideoConfig();
});

// Reload config when localStorage changes
window.addEventListener('storage', function(e) {
    if (e.key === 'aboutVideoData') {
        console.log('About video config updated, reloading...');
        loadAboutVideoConfig();
    }
});
