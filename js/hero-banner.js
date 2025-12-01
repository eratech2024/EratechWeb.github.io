// Hero Banner Dynamic Loader
// Loads banners from localStorage (set by admin panel)

(function() {
    'use strict';
    
    let heroBanners = [];
    let heroBannerSettings = { slideDuration: 5, animationType: 'fade' };
    let currentBannerIndex = 0;
    let bannerInterval = null;
    
    // Map file names to page IDs
    const PAGE_MAP = {
        'index.html': 'home',
        'about.html': 'about',
        'services.html': 'services',
        'projects.html': 'projects',
        'investment.html': 'investment',
        'customers.html': 'customers',
        'news.html': 'news',
        'contact.html': 'contact',
        'recruitment.html': 'recruitment',
        'certificates.html': 'certificates',
        'team.html': 'team',
        'research-development.html': 'research',
        'mission-vision-values.html': 'mission'
    };
    
    // Get current page ID
    function getCurrentPageId() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop() || 'index.html';
        return PAGE_MAP[fileName] || 'home';
    }
    
    // API Base URL
    const API_BASE = 'http://localhost:3000';
    
    // Load banner data from JSON file
    async function loadBannerData() {
        const currentPage = getCurrentPageId();
        
        try {
            // Try to load from API first
            const response = await fetch(API_BASE + '/api/get-data/hero-banner');
            if (response.ok) {
                const result = await response.json();
                const data = result.data || { banners: [], settings: {} };
                // Filter banners: active AND (no pages specified OR current page in pages list)
                heroBanners = (data.banners || []).filter(b => {
                    if (b.active === false) return false;
                    if (!b.pages || b.pages.length === 0) return true; // No pages = all pages
                    return b.pages.includes(currentPage);
                });
                heroBannerSettings = data.settings || { slideDuration: 5, animationType: 'fade' };
                return;
            }
        } catch (e) {
            // Fallback to localStorage
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem('heroBannerData');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                heroBanners = (data.banners || []).filter(b => {
                    if (b.active === false) return false;
                    if (!b.pages || b.pages.length === 0) return true;
                    return b.pages.includes(currentPage);
                });
                heroBannerSettings = data.settings || { slideDuration: 5, animationType: 'fade' };
            } catch (e) {}
        }
    }
    
    // Hide hero section completely
    function hideHeroSection() {
        const heroSection = document.querySelector('section.hero');
        if (heroSection) {
            heroSection.classList.add('hero-hidden');
            document.body.classList.add('hero-is-hidden');
            // Add style to adjust content below
            addHeroHiddenStyles();
        }
    }
    
    // Add styles when hero is hidden
    function addHeroHiddenStyles() {
        if (document.getElementById('hero-hidden-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'hero-hidden-styles';
        style.textContent = `
            /* Hide hero section */
            section.hero.hero-hidden {
                display: none !important;
                height: 0 !important;
                min-height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: hidden !important;
            }
            
            /* Adjust content immediately after hidden hero */
            section.hero.hero-hidden + main,
            section.hero.hero-hidden + section,
            section.hero.hero-hidden ~ main:first-of-type,
            section.hero.hero-hidden ~ section:first-of-type {
                padding-top: 100px !important;
                margin-top: 0 !important;
            }
            
            /* For specific page structures */
            body.hero-is-hidden main:first-of-type,
            body.hero-is-hidden > section:not(.hero):first-of-type {
                padding-top: 100px !important;
            }
            
            /* About page */
            body.hero-is-hidden.about-page main.about {
                padding-top: 100px !important;
            }
            
            /* Certificates page */
            body.hero-is-hidden main.certificates {
                padding-top: 100px !important;
            }
            
            /* Mission vision values page */
            body.hero-is-hidden main.mission-vision-values {
                padding-top: 100px !important;
            }
            
            /* News main, services main, projects main */
            body.hero-is-hidden .news-main,
            body.hero-is-hidden #services-main,
            body.hero-is-hidden #projects-main,
            body.hero-is-hidden #investment-main,
            body.hero-is-hidden #jobs-main {
                padding-top: 100px !important;
            }
            
            /* Customers page */
            body.hero-is-hidden .customers-intro {
                padding-top: 100px !important;
            }
            
            /* Team page */
            body.hero-is-hidden .team-intro {
                padding-top: 100px !important;
            }
            
            /* R&D page */
            body.hero-is-hidden .rd-intro {
                padding-top: 100px !important;
            }
            
            /* Contact page */
            body.hero-is-hidden .contact-info-section {
                padding-top: 100px !important;
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                section.hero.hero-hidden + main,
                section.hero.hero-hidden + section,
                body.hero-is-hidden main:first-of-type,
                body.hero-is-hidden > section:not(.hero):first-of-type,
                body.hero-is-hidden .news-main,
                body.hero-is-hidden #services-main,
                body.hero-is-hidden #projects-main,
                body.hero-is-hidden #investment-main,
                body.hero-is-hidden #jobs-main,
                body.hero-is-hidden .customers-intro,
                body.hero-is-hidden .team-intro,
                body.hero-is-hidden .rd-intro,
                body.hero-is-hidden .contact-info-section,
                body.hero-is-hidden.about-page main.about,
                body.hero-is-hidden main.certificates,
                body.hero-is-hidden main.mission-vision-values {
                    padding-top: 80px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize hero banner
    async function initHeroBanner() {
        await loadBannerData();
        
        const heroContainer = document.querySelector('.hero-image-container');
        
        // If no banners for this page, hide hero section completely
        if (heroBanners.length === 0) {
            hideHeroSection();
            return;
        }
        
        heroBanners.sort((a, b) => a.order - b.order);
        
        const heroContent = document.querySelector('.hero-content .hero-text');
        
        if (!heroContainer) return;
        
        // Mark that custom banners are being used
        heroContainer.setAttribute('data-custom-banners', 'true');
        
        // Clear existing images
        heroContainer.innerHTML = '';
        
        // Add banner images and auto-scale hero section
        const heroSection = document.querySelector('section.hero');
        let maxAspectRatio = 0;
        let loadedImages = 0;
        
        heroBanners.forEach((banner, index) => {
            const img = document.createElement('img');
            img.src = banner.image;
            img.alt = banner.title || 'Hero Banner';
            img.className = `hero-image hero-banner-slide ${index === 0 ? 'active' : ''}`;
            img.dataset.index = index;
            img.dataset.title = banner.title || '';
            img.dataset.subtitle = banner.subtitle || '';
            img.dataset.position = banner.textPosition || 'center';
            img.style.zIndex = index === 0 ? '1' : '0';
            
            // Auto-scale hero section based on image dimensions
            img.onload = function() {
                loadedImages++;
                const aspectRatio = this.naturalHeight / this.naturalWidth;
                if (aspectRatio > maxAspectRatio) {
                    maxAspectRatio = aspectRatio;
                }
                
                // After all images loaded, adjust hero height
                if (loadedImages === heroBanners.length && heroSection) {
                    adjustHeroHeight(heroSection, maxAspectRatio);
                }
            };
            
            heroContainer.appendChild(img);
        });
        
        // Add auto-scale styles
        addAutoScaleStyles();
        
        // Add animation class based on settings
        heroContainer.classList.add(`animation-${heroBannerSettings.animationType}`);
        
        // Update hero text for first banner
        if (heroContent && heroBanners[0]) {
            updateHeroText(heroBanners[0], heroContent);
        }
        
        // Add dots navigation if more than 1 banner
        if (heroBanners.length > 1) {
            addDotsNavigation(heroContainer.parentElement);
            startBannerSlider();
        }
        
        // Add CSS for animations
        addAnimationStyles();
    }
    
    // Update hero text content
    function updateHeroText(banner, container) {
        if (!container) return;
        
        const titleEl = container.querySelector('.hero-title');
        const subtitleEl = container.querySelector('.hero-subtitle');
        
        // Set text alignment based on position
        container.style.textAlign = banner.textPosition || 'center';
        if (banner.textPosition === 'left') {
            container.style.alignItems = 'flex-start';
        } else if (banner.textPosition === 'right') {
            container.style.alignItems = 'flex-end';
        } else {
            container.style.alignItems = 'center';
        }
        
        // Animate text change
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            if (titleEl && banner.title) {
                titleEl.textContent = banner.title;
            }
            if (subtitleEl && banner.subtitle) {
                subtitleEl.innerHTML = banner.subtitle;
            }
            
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Add dots navigation
    function addDotsNavigation(container) {
        // Remove existing dots
        const existingDots = container.querySelector('.hero-dots');
        if (existingDots) existingDots.remove();
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'hero-dots';
        
        heroBanners.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToBanner(index));
            dotsContainer.appendChild(dot);
        });
        
        container.appendChild(dotsContainer);
    }
    
    // Start banner slider
    function startBannerSlider() {
        let duration = (heroBannerSettings.slideDuration || 5) * 1000;
        
        // Increase duration on mobile devices
        if (window.innerWidth <= 768) {
            duration = duration * 2; // Double the duration on mobile
        }
        
        if (bannerInterval) clearInterval(bannerInterval);
        
        bannerInterval = setInterval(() => {
            const nextIndex = (currentBannerIndex + 1) % heroBanners.length;
            goToBanner(nextIndex);
        }, duration);
    }
    
    // Go to specific banner
    function goToBanner(index) {
        const slides = document.querySelectorAll('.hero-banner-slide');
        const dots = document.querySelectorAll('.hero-dots .dot');
        const heroContent = document.querySelector('.hero-content .hero-text');
        const animationType = heroBannerSettings.animationType || 'fade';
        
        if (index === currentBannerIndex) return;
        
        const currentSlide = slides[currentBannerIndex];
        const nextSlide = slides[index];
        
        if (!currentSlide || !nextSlide) return;
        
        // Apply exit animation to current
        currentSlide.classList.add(`${animationType}-out`);
        
        // Slower transitions on mobile
        const isMobile = window.innerWidth <= 768;
        const exitDelay = isMobile ? 500 : 300;
        const enterDelay = isMobile ? 800 : 500;
        
        setTimeout(() => {
            // Remove active from current
            currentSlide.classList.remove('active', `${animationType}-out`);
            currentSlide.style.zIndex = '0';
            
            // Add active to next with enter animation
            nextSlide.classList.add('active', `${animationType}-in`);
            nextSlide.style.zIndex = '1';
            
            setTimeout(() => {
                nextSlide.classList.remove(`${animationType}-in`);
            }, enterDelay);
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            // Update text
            if (heroContent && heroBanners[index]) {
                updateHeroText(heroBanners[index], heroContent);
            }
            
            currentBannerIndex = index;
        }, exitDelay);
        
        // Reset interval
        startBannerSlider();
    }
    
    // Adjust hero section height based on image aspect ratio
    function adjustHeroHeight(heroSection, aspectRatio) {
        if (!heroSection || aspectRatio <= 0) return;
        
        const viewportWidth = window.innerWidth;
        // Calculate height based on image aspect ratio to show full image
        const calculatedHeight = viewportWidth * aspectRatio;
        
        // Set minimum height only, no maximum - let image determine height
        const minHeight = 300;
        
        // Use calculated height (full image height at full width)
        let finalHeight = Math.max(minHeight, calculatedHeight);
        
        // Apply height to hero section
        heroSection.style.height = finalHeight + 'px';
        heroSection.style.minHeight = finalHeight + 'px';
        heroSection.classList.add('hero-auto-scaled');
        
        // Also adjust hero background
        const heroBackground = heroSection.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.height = '100%';
        }
        
        const heroImageContainer = heroSection.querySelector('.hero-image-container');
        if (heroImageContainer) {
            heroImageContainer.style.height = '100%';
        }
    }
    
    // Add auto-scale styles for full image display
    function addAutoScaleStyles() {
        if (document.getElementById('hero-auto-scale-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'hero-auto-scale-styles';
        style.textContent = `
            /* Auto-scaled hero section - full width, height based on image ratio */
            section.hero.hero-auto-scaled {
                position: relative;
                width: 100%;
                overflow: hidden;
            }
            
            section.hero.hero-auto-scaled .hero-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            section.hero.hero-auto-scaled .hero-image-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            /* Full image display - cover full area, no black bars */
            section.hero.hero-auto-scaled .hero-banner-slide,
            section.hero.hero-auto-scaled .hero-image {
                object-fit: cover !important;
                object-position: center center !important;
                width: 100% !important;
                height: 100% !important;
            }
            
            /* Ensure overlay covers full area */
            section.hero.hero-auto-scaled .hero-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            /* Adjust content positioning */
            section.hero.hero-auto-scaled .hero-content {
                position: relative;
                z-index: 2;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                section.hero.hero-auto-scaled {
                    min-height: 250px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add animation styles
    function addAnimationStyles() {
        if (document.getElementById('hero-banner-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'hero-banner-styles';
        style.textContent = `
            .hero-banner-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.5s ease, transform 0.5s ease, visibility 0s 0.5s;
                z-index: 0;
            }
            
            .hero-banner-slide.active {
                opacity: 1;
                visibility: visible;
                transition: opacity 0.5s ease, transform 0.5s ease, visibility 0s 0s;
                z-index: 1;
            }
            
            /* Fade Animation */
            .animation-fade .hero-banner-slide.fade-out {
                opacity: 0;
            }
            .animation-fade .hero-banner-slide.fade-in {
                opacity: 1;
            }
            
            /* Slide Animation */
            .animation-slide .hero-banner-slide {
                transform: translateX(100%);
            }
            .animation-slide .hero-banner-slide.active {
                transform: translateX(0);
            }
            .animation-slide .hero-banner-slide.slide-out {
                transform: translateX(-100%);
            }
            .animation-slide .hero-banner-slide.slide-in {
                transform: translateX(0);
            }
            
            /* Zoom Animation */
            .animation-zoom .hero-banner-slide {
                transform: scale(1.1);
                opacity: 0;
            }
            .animation-zoom .hero-banner-slide.active {
                transform: scale(1);
                opacity: 1;
            }
            .animation-zoom .hero-banner-slide.zoom-out {
                transform: scale(0.9);
                opacity: 0;
            }
            .animation-zoom .hero-banner-slide.zoom-in {
                transform: scale(1);
                opacity: 1;
            }
            
            /* Flip Animation */
            .animation-flip .hero-banner-slide {
                transform: rotateY(90deg);
                opacity: 0;
            }
            .animation-flip .hero-banner-slide.active {
                transform: rotateY(0);
                opacity: 1;
            }
            .animation-flip .hero-banner-slide.flip-out {
                transform: rotateY(-90deg);
                opacity: 0;
            }
            .animation-flip .hero-banner-slide.flip-in {
                transform: rotateY(0);
                opacity: 1;
            }
            
            /* Hero text transition */
            .hero-text {
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroBanner);
    } else {
        initHeroBanner();
    }
    
    // Restart slider on window resize to adjust timing and height
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (heroBanners.length > 1) {
            startBannerSlider();
        }
        
        // Debounce resize for height adjustment
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (heroBanners.length > 0) {
                const heroSection = document.querySelector('section.hero');
                const firstImage = document.querySelector('.hero-banner-slide');
                if (heroSection && firstImage && firstImage.naturalWidth > 0) {
                    const aspectRatio = firstImage.naturalHeight / firstImage.naturalWidth;
                    adjustHeroHeight(heroSection, aspectRatio);
                }
            }
        }, 100);
    });
})();
