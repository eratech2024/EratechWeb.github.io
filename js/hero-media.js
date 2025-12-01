// Hero Media Dynamic Loader

let heroMediaData = [];
let currentSlide = 0;
let slideInterval;

// API Base URL
const HERO_MEDIA_API_BASE = 'http://localhost:3000';

// Load hero media from API or localStorage
async function loadHeroMedia() {
    // Try to load from API first
    try {
        const response = await fetch(HERO_MEDIA_API_BASE + '/api/get-data/hero-media');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.heroMedia) {
                heroMediaData = result.data.heroMedia.filter(item => item.active !== false);
                console.log('Hero media loaded from API');
                initializeHeroMedia();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('heroMediaData');
    if (stored) {
        try {
            heroMediaData = JSON.parse(stored);
            initializeHeroMedia();
            return;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }
    
    // Fallback to JSON file
    try {
        const response = await fetch('data/hero-media-data.json');
        const data = await response.json();
        heroMediaData = data.heroMedia.filter(item => item.active !== false);
        initializeHeroMedia();
    } catch (error) {
        console.error('Error loading hero media:', error);
        useDefaultHeroMedia();
    }
}

// Use default hero media if loading fails
function useDefaultHeroMedia() {
    heroMediaData = [
        {
            id: 1,
            type: 'image',
            src: 'images/Annghiep.jpg',
            alt: 'Hero 1',
            order: 1,
            active: true
        },
        {
            id: 2,
            type: 'image',
            src: 'images/Chengloongbanner.jpg',
            alt: 'Hero 2',
            order: 2,
            active: true
        },
        {
            id: 3,
            type: 'image',
            src: 'images/Taisudung.jpg',
            alt: 'Hero 3',
            order: 3,
            active: true
        }
    ];
    initializeHeroMedia();
}

// Initialize hero media display
function initializeHeroMedia() {
    if (!heroMediaData || heroMediaData.length === 0) return;

    // Sort by order
    heroMediaData.sort((a, b) => a.order - b.order);

    // Get containers
    const imageContainer = document.querySelector('.hero-image-container');
    const dotsContainer = document.querySelector('.hero-dots');

    if (!imageContainer || !dotsContainer) {
        console.error('Hero containers not found');
        return;
    }

    if (imageContainer.getAttribute('data-custom-banners') === 'true') return;

    // Clear existing content
    imageContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Create media elements
    heroMediaData.forEach((media, index) => {
        if (media.type === 'video') {
            // Create video element
            const video = document.createElement('video');
            video.src = media.src;
            video.alt = media.alt || media.title || 'Hero Video';
            video.className = 'hero-image' + (index === 0 ? ' active' : '');
            video.setAttribute('data-aos', 'fade');
            video.style.zIndex = index === 0 ? '1' : '0';
            video.muted = true;
            video.loop = true;
            video.autoplay = index === 0;
            video.playsInline = true;
            imageContainer.appendChild(video);
        } else {
            // Create image element
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = media.alt || media.title || 'Hero Image';
            img.className = 'hero-image' + (index === 0 ? ' active' : '');
            img.setAttribute('data-aos', 'fade');
            img.style.zIndex = index === 0 ? '1' : '0';
            imageContainer.appendChild(img);
        }

        // Create dot
        const dot = document.createElement('button');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    // Start auto-slide
    startAutoSlide();

}

// Go to specific slide
function goToSlide(index) {
    const images = document.querySelectorAll('.hero-image');
    const dots = document.querySelectorAll('.hero-dots .dot');

    if (!images.length || !dots.length) return;

    // Remove active class from all
    images.forEach(img => {
        img.classList.remove('active');
        img.style.zIndex = '0';
        if (img.tagName === 'VIDEO') {
            img.pause();
        }
    });
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current
    currentSlide = index;
    if (images[currentSlide]) {
        images[currentSlide].classList.add('active');
        images[currentSlide].style.zIndex = '1';
    }
    if (dots[currentSlide]) {
        dots[currentSlide].classList.add('active');
    }

    // Play video if it's a video
    if (images[currentSlide] && images[currentSlide].tagName === 'VIDEO') {
        images[currentSlide].play();
    }
}

// Next slide
function nextSlide() {
    const nextIndex = (currentSlide + 1) % heroMediaData.length;
    goToSlide(nextIndex);
}

// Previous slide
function prevSlide() {
    const prevIndex = (currentSlide - 1 + heroMediaData.length) % heroMediaData.length;
    goToSlide(prevIndex);
}

// Start auto-slide
function startAutoSlide() {
    // Clear existing interval
    if (slideInterval) {
        clearInterval(slideInterval);
    }

    // Start new interval (change slide every 5 seconds)
    slideInterval = setInterval(nextSlide, 5000);
}

// Stop auto-slide
function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to let hero-banner.js run first
    setTimeout(() => {
        loadHeroMedia();

        // Pause auto-slide when user hovers over hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopAutoSlide);
            heroSection.addEventListener('mouseleave', startAutoSlide);
        }
    }, 100);
});

// Reload hero media when localStorage changes (for admin updates)
window.addEventListener('storage', function(e) {
    if (e.key === 'heroMediaData') {
        loadHeroMedia();
    }
});
