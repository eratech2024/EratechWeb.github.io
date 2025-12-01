// ERATECH Website - Custom JavaScript

// Chặn chuột phải trên toàn bộ trang
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Chặn các phím tắt copy (Ctrl+C, Ctrl+U, Ctrl+S, F12)
document.addEventListener('keydown', function(e) {
    // Ctrl+C, Ctrl+U, Ctrl+S
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
    }
    // F12 (DevTools)
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
});

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 600,
        easing: 'ease-out-cubic',
        once: false,
        offset: 30,
        mirror: true,
        anchorPlacement: 'top-bottom'
    });

    // Loading Screen removed for immediate banner animation

    // Hero Slider
    const heroImages = document.querySelectorAll('.hero-image');
    const heroDots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideTimeout;

    function showSlide(index) {
        // Fade out current
        heroImages.forEach((img, i) => {
            if (i === currentSlide) {
                img.style.opacity = '0';
            }
        });
        
        setTimeout(() => {
            heroImages.forEach((img, i) => {
                img.classList.toggle('active', i === index);
                if (i === index) {
                    img.style.opacity = '1';
                }
            });
            heroDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            currentSlide = index;

            // Start next slide timeout
            clearTimeout(slideTimeout);
            slideTimeout = setTimeout(nextSlide, 3000);
        }, 300);
    }

    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= heroImages.length) next = 0;
        showSlide(next);
    }

    // Initial slide - immediate setup without delay
    if (heroImages.length > 0) {
        heroImages[0].style.opacity = '1';
        heroImages[0].classList.add('active');
        if (heroDots.length > 0) {
            heroDots[0].classList.add('active');
        }
        currentSlide = 0;
        // Start cycle immediately
        slideTimeout = setTimeout(nextSlide, 3000);
    }

    // Dot navigation
    heroDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearTimeout(slideTimeout);
            showSlide(index);
        });
    });

    // Lazy Loading
    const lazyImages = document.querySelectorAll('.lazy-load');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src; // Fallback if no data-src
                img.classList.remove('lazy-load');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.dataset.count);
                let count = 0;
                const increment = target / 100;
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        stat.textContent = target;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(count);
                    }
                }, 20);
                statsObserver.unobserve(stat);
            }
        });
    });

    statNumbers.forEach(stat => statsObserver.observe(stat));

    // Projects Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter projects
            projectItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Mobile Menu - handled by initMobileMenu() at end of file

    // Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    
    // Function to initialize sticky header
    let stickyHeaderRetries = 0;
    const maxRetries = 50; // Try for 5 seconds (50 * 100ms)
    
    function initStickyHeader() {
        const header = document.querySelector('.header');
        let headerHeight = 0;
        let headerPlaceholder = null;
        let isInitialLoad = true;
        let wasSticky = false;
        
        if (!header) {
            // If header not found, try again after a delay
            stickyHeaderRetries++;
            if (stickyHeaderRetries < maxRetries) {
                setTimeout(initStickyHeader, 100);
            } else {
                console.warn('Header not found after', maxRetries, 'retries');
            }
            return;
        }
        
        
        // Get header height but don't create placeholder to avoid visual issues
        headerHeight = header.offsetHeight;
        // headerPlaceholder = document.createElement('div');
        // headerPlaceholder.className = 'header-placeholder';
        // headerPlaceholder.style.height = headerHeight + 'px';
        // header.parentNode.insertBefore(headerPlaceholder, header.nextSibling);
        
        // Function to handle scroll
        function handleScroll() {
            // Back to top button
            if (backToTop) {
                if (window.scrollY > 300) {
                    backToTop.classList.add('show');
                } else {
                    backToTop.classList.remove('show');
                }
            }
            
            // Sticky header
            if (header) {
                const shouldBeSticky = window.scrollY > 50; // Lower threshold for easier testing
                
                if (shouldBeSticky && !wasSticky) {
                    // Becoming sticky
                    header.classList.add('sticky');
                    
                    // Only add animation if not initial load
                    if (!isInitialLoad) {
                        header.classList.add('animated');
                        setTimeout(() => {
                            header.classList.remove('animated');
                        }, 300);
                    }
                    
                    wasSticky = true;
                } else if (!shouldBeSticky && wasSticky) {
                    // Becoming not sticky
                    header.classList.remove('sticky', 'animated');
                    wasSticky = false;
                }
                
                // After first check, no longer initial load
                if (isInitialLoad) {
                    isInitialLoad = false;
                }
            }
        }
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        
        // Check scroll position immediately (without animation)
        handleScroll();
        
        // Force a check after a short delay to ensure everything is ready
        setTimeout(handleScroll, 500);
    }
    
    // Initialize sticky header (with retry logic for included header)
    initStickyHeader();
    
    // Listen for includes loaded event (primary method)
    window.addEventListener('includesLoaded', () => {
        setTimeout(() => {
            initStickyHeader();
        }, 100);
    });
    
    // Also watch for header being added to DOM (backup method)
    const observer = new MutationObserver((mutations) => {
        const header = document.querySelector('.header');
        if (header && !header.hasAttribute('data-sticky-initialized')) {
            header.setAttribute('data-sticky-initialized', 'true');
            observer.disconnect();
            setTimeout(() => {
                initStickyHeader();
            }, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Additional fallback - check periodically for first 10 seconds
    let fallbackChecks = 0;
    const fallbackInterval = setInterval(() => {
        fallbackChecks++;
        const header = document.querySelector('.header');
        if (header && !header.hasAttribute('data-sticky-initialized')) {
            header.setAttribute('data-sticky-initialized', 'true');
            clearInterval(fallbackInterval);
            initStickyHeader();
        } else if (fallbackChecks >= 100) { // 10 seconds
            clearInterval(fallbackInterval);
        }
    }, 100);
    
    // Special check for about page and other pages that might have issues
    setTimeout(() => {
        const header = document.querySelector('.header');
        if (header && !header.hasAttribute('data-sticky-initialized')) {
            header.setAttribute('data-sticky-initialized', 'true');
            initStickyHeader();
        }
    }, 2000);

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                alert('Cảm ơn bạn đã đăng ký nhận tin!');
                newsletterForm.reset();
            }
        });
    }

    // Language Switcher (Basic - reload with lang param)
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // In a real app, this would switch content or redirect
        });
    });

    // News Carousel Implementation
    const newsContainer = document.getElementById('news-container');
    const newsGrid = document.getElementById('news-grid');
    const carouselPrev = document.getElementById('carousel-prev');
    const carouselNext = document.getElementById('carousel-next');
    const carouselIndicators = document.getElementById('carousel-indicators');

    // News filtering and search
    const newsFilterBtns = document.querySelectorAll('.news-filter .filter-btn');
    const newsSearchInput = document.getElementById('news-search');
    const newsSearchBtn = document.querySelector('.search-btn');

    // Carousel state variables
    let currentNewsSlide = 0;
    let totalSlides = 0;
    let itemsPerSlide = 3; // Show 3 items per slide on desktop
    let currentFilter = 'all';
    let currentSearch = '';

    // Loading state functionality
    function showLoadingState(container) {
        const loadingHTML = `
            <div class="news-loading">
                <div class="loading-spinner"></div>
                <p>Đang tải tin tức...</p>
            </div>
        `;
        container.innerHTML = loadingHTML;
    }

    function hideLoadingState(container) {
        const loadingElement = container.querySelector('.news-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // Update items per slide based on screen size
    function updateItemsPerSlide() {
        if (window.innerWidth <= 768) {
            itemsPerSlide = 1; // Mobile: 1 item per slide
        } else if (window.innerWidth <= 1024) {
            itemsPerSlide = 2; // Tablet: 2 items per slide
        } else {
            itemsPerSlide = 3; // Desktop: 3 items per slide
        }
    }

    // News Modal Functionality
    function showNewsModal(article) {
        const modalHTML = `
            <div id="news-modal" class="news-modal">
                <div class="news-modal-content">
                    <span class="news-modal-close">&times;</span>
                    <div class="news-modal-header">
                        <img src="${article.image}" alt="${article.title}">
                        <div class="news-modal-meta">
                            <span>${article.date}</span>
                            <span><i class="fas fa-tags"></i> ${article.category}</span>
                        </div>
                    </div>
                    <div class="news-modal-body">
                        <h2>${article.title}</h2>
                        ${article.content || `<p>${article.excerpt}</p>`}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('news-modal');
        const closeBtn = modal.querySelector('.news-modal-close');

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Load news data from localStorage or default data
    let newsData = [];
    
    async function loadNewsData() {
        // Try to load from API first
        try {
            const response = await fetch('http://localhost:3000/api/get-data/news');
            if (response.ok) {
                const result = await response.json();
                if (result.data && result.data.articles) {
                    newsData = result.data.articles;
                    console.log('News loaded from API');
                    return newsData;
                }
            }
        } catch (apiError) {
            console.warn('API load failed, trying localStorage:', apiError.message);
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem('newsArticles');
        if (stored) {
            newsData = JSON.parse(stored);
            return newsData;
        }
        
        // Load from JSON file if localStorage is empty
        try {
            const response = await fetch('data/news-data.json');
            const data = await response.json();
            newsData = data.articles;
            return newsData;
        } catch (error) {
            console.error('Error loading news data:', error);
            // Fallback data
            newsData = [
                        {
                            id: 1,
                            title: 'Dự án xử lý nước thải khu công nghiệp Long Hậu',
                    excerpt: 'Dự án trị giá 300 tỷ đồng hoàn thành giai đoạn 1, xử lý 80.000 m³ nước thải/ngày cho khu công nghiệp lớn nhất miền Tây.',
                    image: 'images/DJI_0565.jpg',
                    date: '2024-02-01',
                    category: 'Dự án',
                    featured: false,
            content: `
                <p>ERATECH Group vừa hoàn thành giai đoạn 1 của dự án xử lý nước thải khu công nghiệp Long Hậu với tổng trị giá 300 tỷ đồng. Dự án này phục vụ cho khu công nghiệp lớn nhất miền Tây Nam Bộ, xử lý 80.000 m³ nước thải/ngày.</p>

                <p>Hệ thống xử lý bao gồm công nghệ lọc màng RO tiên tiến, hệ thống khử trùng UV và công nghệ oxy hóa tiên tiến (AOP). Dự án được thiết kế để đạt chuẩn xả thải nghiêm ngặt nhất của EU và đáp ứng nhu cầu mở rộng sản xuất của các doanh nghiệp trong khu vực.</p>

                <p>Ông Trần Văn B - Giám đốc dự án chia sẻ: "Dự án không chỉ giải quyết vấn đề ô nhiễm mà còn tạo ra nguồn nước tái chế có thể tái sử dụng trong sản xuất, tiết kiệm 40% chi phí nước cho các doanh nghiệp."</p>

                <p>Giai đoạn 2 của dự án sẽ được triển khai trong quý III/2024 với công suất tăng lên 120.000 m³/ngày.</p>
            `
        },
        {
            title: 'Hoàn thành dự án tái chế chất thải điện tử tại TP.HCM',
            excerpt: 'Dự án đầu tiên tại Việt Nam tái chế 100% linh kiện điện tử, thu hồi 95% kim loại quý hiếm.',
            image: 'images/DJI_0566.jpg',
            date: '2024-01-28',
            category: 'Dự án',
            content: `
                <p>ERATECH Group chính thức hoàn thành dự án tái chế chất thải điện tử đầu tiên tại Việt Nam với công suất 50 tấn/ngày. Dự án này có thể tái chế 100% linh kiện điện tử và thu hồi đến 95% kim loại quý hiếm.</p>

                <p>Công nghệ tái chế bao gồm hệ thống phân loại tự động bằng AI, công nghệ tách kim loại không độc hại và hệ thống xử lý hóa chất tiên tiến. Dự án được đầu tư 150 tỷ đồng và tạo ra 200 việc làm trực tiếp.</p>

                <p>Bà Lê Thị C - Giám đốc Trung tâm Tái chế ERATECH cho biết: "Dự án này giải quyết vấn đề chất thải điện tử ngày càng tăng tại Việt Nam, đồng thời tạo ra nguồn nguyên liệu quý hiếm cho ngành công nghiệp điện tử."</p>

                <p>Dự án đã được Bộ Tài nguyên và Môi trường công nhận là mô hình tái chế xanh tiêu biểu.</p>
            `
        },
        {
            title: 'Dự án hệ thống giám sát môi trường thông minh cho 15 khu công nghiệp',
            excerpt: 'Triển khai hệ thống IoT giám sát thời gian thực, cảnh báo sớm 99% vi phạm môi trường.',
            image: 'images/DJI_0570.jpg',
            date: '2024-01-25',
            category: 'Dự án',
            content: `
                <p>ERATECH Group triển khai thành công hệ thống giám sát môi trường thông minh cho 15 khu công nghiệp trên cả nước. Hệ thống sử dụng công nghệ IoT và AI để giám sát thời gian thực, cảnh báo sớm 99% vi phạm môi trường.</p>

                <p>Hệ thống bao gồm 500 điểm giám sát chất lượng không khí, nước thải và tiếng ồn, được kết nối với trung tâm điều khiển thông minh. Dự án được đầu tư 200 tỷ đồng và giúp giảm 60% thời gian xử lý vi phạm môi trường.</p>

                <p>Ông Phạm Văn D - Giám đốc Trung tâm Giám sát chia sẻ: "Hệ thống này giúp các cơ quan quản lý môi trường chủ động hơn trong việc bảo vệ môi trường, đồng thời hỗ trợ doanh nghiệp tuân thủ pháp luật một cách hiệu quả."</p>

                <p>Dự án đã được Tổng cục Môi trường đánh giá cao và đề xuất nhân rộng trên toàn quốc.</p>
            `
        },
        {
            title: 'Xây dựng nhà máy sản xuất thiết bị môi trường xanh tại Bình Dương',
            excerpt: 'Nhà máy 50.000 m² với công nghệ sản xuất xanh, công suất 10.000 thiết bị/năm.',
            image: 'images/DJI_0576.jpg',
            date: '2024-01-20',
            category: 'Dự án',
            content: `
                <p>ERATECH Group khởi công xây dựng nhà máy sản xuất thiết bị môi trường xanh tại Bình Dương với diện tích 50.000 m². Nhà máy được thiết kế theo tiêu chuẩn xanh, công suất 10.000 thiết bị/năm.</p>

                <p>Nhà máy sử dụng công nghệ sản xuất tự động hóa 4.0, hệ thống năng lượng mặt trời và công nghệ tái chế nước. Dự án được đầu tư 400 tỷ đồng và tạo ra 500 việc làm chất lượng cao.</p>

                <p>Bà Nguyễn Thị E - Tổng Giám đốc ERATECH chia sẻ: "Nhà máy này không chỉ đáp ứng nhu cầu thiết bị môi trường trong nước mà còn xuất khẩu sang các nước Đông Nam Á."</p>

                <p>Dự án dự kiến hoàn thành trong quý IV/2024 và đạt chứng nhận LEED Platinum.</p>
            `
        },
        {
            title: 'Dự án xử lý khí thải công nghiệp cho cụm hóa chất miền Bắc',
            excerpt: 'Giảm 98% khí thải độc hại cho 20 nhà máy hóa chất, đầu tư 250 tỷ đồng.',
            image: 'images/DJI_0577.jpg',
            date: '2024-01-18',
            category: 'Dự án',
            content: `
                <p>ERATECH Group triển khai dự án xử lý khí thải công nghiệp cho cụm nhà máy hóa chất miền Bắc. Dự án giúp giảm 98% khí thải độc hại cho 20 nhà máy hóa chất với tổng đầu tư 250 tỷ đồng.</p>

                <p>Hệ thống xử lý sử dụng công nghệ RTO (Regenerative Thermal Oxidizer) và công nghệ hấp phụ tiên tiến. Dự án được thiết kế để đạt chuẩn khí thải nghiêm ngặt nhất châu Âu.</p>

                <p>Ông Hoàng Văn F - Giám đốc dự án cho biết: "Dự án này cải thiện đáng kể chất lượng không khí khu vực, đồng thời giúp các doanh nghiệp hóa chất tiết kiệm chi phí xử lý khí thải."</p>

                <p>Dự án đã được Bộ Công Thương công nhận là dự án môi trường tiêu biểu năm 2024.</p>
            `
        },
        {
            title: 'Triển khai dự án năng lượng tái tạo cho khu công nghiệp xanh',
            excerpt: 'Hệ thống điện mặt trời 10 MWp cung cấp 100% điện cho khu công nghiệp, tiết kiệm 30% chi phí năng lượng.',
            image: 'images/DJI_0578.jpg',
            date: '2024-01-15',
            category: 'Dự án',
            content: `
                <p>ERATECH Group triển khai dự án năng lượng tái tạo cho khu công nghiệp xanh với hệ thống điện mặt trời 10 MWp. Dự án cung cấp 100% điện cho khu công nghiệp, tiết kiệm 30% chi phí năng lượng.</p>

                <p>Hệ thống bao gồm 25.000 tấm pin mặt trời, hệ thống lưu trữ năng lượng và trung tâm điều khiển thông minh. Dự án được đầu tư 180 tỷ đồng và có thời gian hoàn vốn 6 năm.</p>

                <p>Bà Trần Thị G - Giám đốc Năng lượng ERATECH chia sẻ: "Dự án này không chỉ giảm phát thải CO2 mà còn tạo ra mô hình khu công nghiệp xanh cho Việt Nam."</p>

                <p>Dự án đã được Bộ Công Thương và Bộ Tài nguyên và Môi trường hỗ trợ về chính sách.</p>
            `
        },
        {
            title: 'ERATECH hoàn thành dự án xử lý nước thải lớn nhất miền Nam',
            excerpt: 'Dự án trị giá 500 tỷ đồng đã được đưa vào vận hành thành công, cung cấp nước sạch cho hơn 100.000 hộ dân khu vực.',
            image: 'images/DJI_0579.jpg',
            date: '2024-01-10',
            category: 'Dự án',
            content: `
                <p>ERATECH Group vừa hoàn thành thành công dự án xử lý nước thải lớn nhất miền Nam Việt Nam với tổng trị giá lên đến 500 tỷ đồng. Dự án này đánh dấu một bước ngoặt quan trọng trong việc cung cấp nước sạch cho hơn 100.000 hộ dân tại khu vực Đồng bằng sông Cửu Long.</p>

                <p>Dự án được triển khai với công nghệ xử lý nước thải tiên tiến nhất hiện nay, bao gồm hệ thống lọc sinh học, công nghệ màng lọc nano và hệ thống khử trùng bằng ozone. Công suất xử lý đạt 150.000 m³ nước thải/ngày, đảm bảo chất lượng nước đầu ra đạt chuẩn QCVN 14:2008/BTNMT.</p>

                <p>Ông Nguyễn Văn A - Tổng Giám đốc ERATECH Group chia sẻ: "Dự án này không chỉ giải quyết vấn đề ô nhiễm môi trường mà còn tạo ra nguồn nước tái sử dụng có thể phục vụ cho sản xuất công nghiệp, góp phần vào sự phát triển bền vững của khu vực."</p>

                <p>Dự án đã được Bộ Tài nguyên và Môi trường đánh giá cao về hiệu quả xử lý và được đề xuất làm mô hình cho các dự án tương tự trên cả nước.</p>
            `
        },
        {
            title: 'Công nghệ mới trong xử lý khí thải được ERATECH áp dụng',
            excerpt: 'Công nghệ RTO tiên tiến giúp giảm 95% khí thải độc hại, đạt chuẩn quốc tế về bảo vệ môi trường.',
            image: 'images/DJI_0566.jpg',
            date: '2024-01-10',
            category: 'Công nghệ',
            content: `
                <p>ERATECH Group chính thức áp dụng công nghệ RTO (Regenerative Thermal Oxidizer) tiên tiến trong xử lý khí thải công nghiệp. Công nghệ này giúp giảm đến 95% lượng khí thải độc hại, đạt chuẩn quốc tế về bảo vệ môi trường.</p>

                <p>Hệ thống RTO hoạt động dựa trên nguyên lý oxy hóa nhiệt các chất hữu cơ bay hơi (VOC) ở nhiệt độ cao, chuyển hóa chúng thành CO2 và H2O. Công nghệ này đặc biệt hiệu quả với các ngành công nghiệp như hóa chất, dược phẩm, sơn và in ấn.</p>

                <p>Ưu điểm nổi bật của công nghệ RTO:</p>
                <ul>
                    <li>Hiệu suất xử lý lên đến 99%</li>
                    <li>Tiết kiệm năng lượng nhờ hệ thống tái sinh nhiệt</li>
                    <li>Hoạt động liên tục, ổn định</li>
                    <li>Chi phí vận hành thấp</li>
                </ul>

                <p>ERATECH đã triển khai thành công hệ thống RTO cho hơn 20 doanh nghiệp lớn trên cả nước, góp phần cải thiện chất lượng không khí và bảo vệ sức khỏe cộng đồng.</p>
            `
        },
        {
            title: 'ERATECH nhận giải thưởng doanh nghiệp xanh 2023',
            excerpt: 'Công ty được vinh danh tại lễ trao giải môi trường quốc gia với các đóng góp xuất sắc cho ngành công nghiệp xanh.',
            image: 'images/DJI_0570.jpg',
            date: '2024-01-05',
            category: 'Giải thưởng',
            content: `
                <p>ERATECH Group vinh dự nhận giải thưởng "Doanh nghiệp xanh 2023" tại Lễ trao giải Môi trường Quốc gia do Bộ Tài nguyên và Môi trường tổ chức. Đây là năm thứ 3 liên tiếp công ty được vinh danh với những đóng góp xuất sắc cho ngành công nghiệp xanh.</p>

                <p>Giải thưởng được trao dựa trên các tiêu chí:</p>
                <ul>
                    <li>Đổi mới công nghệ xử lý môi trường</li>
                    <li>Giảm thiểu phát thải khí nhà kính</li>
                    <li>Tái sử dụng tài nguyên hiệu quả</li>
                    <li>Đầu tư vào nghiên cứu phát triển</li>
                    <li>Đóng góp cho cộng đồng</li>
                </ul>

                <p>Bà Trần Thị B - Phó Tổng Giám đốc ERATECH chia sẻ: "Giải thưởng này là động lực để chúng tôi tiếp tục đổi mới và phát triển các giải pháp công nghệ xanh, góp phần xây dựng một Việt Nam xanh và bền vững."</p>

                <p>ERATECH cam kết sẽ tiếp tục đầu tư mạnh mẽ vào công nghệ môi trường, hướng tới mục tiêu zero waste và carbon neutral trong tương lai gần.</p>
            `
        },
        {
            title: 'Hợp tác chiến lược với các đối tác quốc tế',
            excerpt: 'ERATECH ký kết thỏa thuận hợp tác với các công ty công nghệ môi trường hàng đầu châu Âu.',
            image: 'images/DJI_0576.jpg',
            date: '2024-01-01',
            category: 'Hợp tác',
            content: `
                <p>ERATECH Group vừa ký kết thỏa thuận hợp tác chiến lược với các công ty công nghệ môi trường hàng đầu châu Âu. Thỏa thuận này mở ra cơ hội hợp tác sâu rộng trong nghiên cứu, phát triển và chuyển giao công nghệ.</p>

                <p>Các đối tác bao gồm:</p>
                <ul>
                    <li>Veolia Water Technologies (Pháp)</li>
                    <li>SUEZ Water Technologies (Pháp)</li>
                    <li>GE Water & Process Technologies (Mỹ)</li>
                    <li>Degremont (Pháp)</li>
                </ul>

                <p>Thỏa thuận hợp tác tập trung vào:</p>
                <ul>
                    <li>Chuyển giao công nghệ xử lý nước tiên tiến</li>
                    <li>Nghiên cứu chung về công nghệ xanh</li>
                    <li>Đào tạo nhân lực chuyên môn cao</li>
                    <li>Đầu tư chung vào các dự án môi trường</li>
                </ul>

                <p>Ông David C - Giám đốc Đối ngoại ERATECH cho biết: "Việc hợp tác với các đối tác quốc tế sẽ giúp ERATECH tiếp cận công nghệ tiên tiến nhất trên thế giới, đồng thời góp phần nâng cao vị thế của Việt Nam trong lĩnh vực công nghệ môi trường."</p>
            `
        },
        {
            title: 'Đầu tư 200 tỷ đồng vào nghiên cứu công nghệ tái chế',
            excerpt: 'ERATECH cam kết đầu tư mạnh mẽ vào nghiên cứu và phát triển công nghệ tái chế chất thải tiên tiến.',
            image: 'images/DJI_0577.jpg',
            date: '2023-12-28',
            category: 'Đầu tư',
            content: `
                <p>ERATECH Group chính thức công bố đầu tư 200 tỷ đồng vào nghiên cứu và phát triển công nghệ tái chế chất thải. Dự án này được thực hiện trong 3 năm, với mục tiêu phát triển các công nghệ tái chế tiên tiến cho Việt Nam.</p>

                <p>Đầu tư tập trung vào các lĩnh vực:</p>
                <ul>
                    <li>Công nghệ tái chế nhựa và polymer</li>
                    <li>Tái chế kim loại hiếm</li>
                    <li>Xử lý và tái sử dụng chất thải điện tử</li>
                    <li>Công nghệ upcycling chất thải công nghiệp</li>
                </ul>

                <p>Mục tiêu của dự án:</p>
                <ul>
                    <li>Tăng tỷ lệ tái chế chất thải lên 80%</li>
                    <li>Giảm phát thải CO2 từ quá trình sản xuất</li>
                    <li>Tạo ra sản phẩm có giá trị từ chất thải</li>
                    <li>Phát triển ngành công nghiệp tái chế xanh</li>
                </ul>

                <p>TS. Nguyễn Văn D - Giám đốc Trung tâm Nghiên cứu ERATECH chia sẻ: "Việt Nam đang đối mặt với vấn đề chất thải ngày càng tăng. Đầu tư vào công nghệ tái chế không chỉ giải quyết vấn đề môi trường mà còn tạo ra cơ hội kinh tế mới."</p>
            `
        },
        {
            title: 'Thành công triển khai hệ thống giám sát môi trường thông minh',
            excerpt: 'Hệ thống IoT giúp theo dõi chất lượng môi trường thời gian thực tại các khu công nghiệp.',
            image: 'images/DJI_0578.jpg',
            date: '2023-12-20',
            category: 'Công nghệ',
            content: `
                <p>ERATECH Group triển khai thành công hệ thống giám sát môi trường thông minh tại các khu công nghiệp lớn. Hệ thống sử dụng công nghệ IoT và AI để theo dõi chất lượng môi trường thời gian thực.</p>

                <p>Hệ thống bao gồm:</p>
                <ul>
                    <li>Cảm biến chất lượng không khí</li>
                    <li>Cảm biến chất lượng nước</li>
                    <li>Cảm biến tiếng ồn</li>
                    <li>Camera giám sát tự động</li>
                    <li>Hệ thống AI phân tích dữ liệu</li>
                </ul>

                <p>Lợi ích của hệ thống:</p>
                <ul>
                    <li>Giám sát 24/7 tự động</li>
                    <li>Cảnh báo sớm vi phạm môi trường</li>
                    <li>Phân tích xu hướng và dự báo</li>
                    <li>Hỗ trợ ra quyết định kịp thời</li>
                    <li>Giảm chi phí giám sát thủ công</li>
                </ul>

                <p>Hệ thống đã được triển khai tại 15 khu công nghiệp trên cả nước và nhận được đánh giá cao từ các cơ quan quản lý môi trường.</p>
            `
        },
        {
            title: 'ERATECH mở rộng nhà máy sản xuất thiết bị môi trường',
            excerpt: 'Nhà máy mới với diện tích 50.000m² sẽ tăng công suất sản xuất lên 300% để đáp ứng nhu cầu thị trường.',
            image: 'images/DJI_0579.jpg',
            date: '2023-12-15',
            category: 'Dự án',
            content: `
                <p>ERATECH Group chính thức mở rộng nhà máy sản xuất thiết bị môi trường với diện tích 50.000m². Dự án này sẽ tăng công suất sản xuất lên 300% để đáp ứng nhu cầu ngày càng tăng của thị trường.</p>

                <p>Nhà máy mới được trang bị:</p>
                <ul>
                    <li>Dây chuyền sản xuất tự động hóa</li>
                    <li>Hệ thống kiểm soát chất lượng tiên tiến</li>
                    <li>Công nghệ sản xuất xanh</li>
                    <li>Kho bãi thông minh</li>
                </ul>

                <p>Mục tiêu của dự án:</p>
                <ul>
                    <li>Tăng sản lượng thiết bị môi trường</li>
                    <li>Cải thiện chất lượng sản phẩm</li>
                    <li>Giảm chi phí sản xuất</li>
                    <li>Mở rộng thị trường xuất khẩu</li>
                </ul>

                <p>Việc mở rộng nhà máy sẽ tạo thêm 500 việc làm cho lao động địa phương và góp phần thúc đẩy kinh tế khu vực.</p>
            `
        },
        {
            title: 'Công nghệ AI ứng dụng trong xử lý nước thải thông minh',
            excerpt: 'Hệ thống trí tuệ nhân tạo giúp tối ưu hóa quy trình xử lý nước thải, tiết kiệm 40% năng lượng tiêu thụ.',
            image: 'images/DJI_0580.jpg',
            date: '2023-12-10',
            category: 'Công nghệ',
            content: `
                <p>ERATECH Group triển khai thành công công nghệ trí tuệ nhân tạo (AI) trong hệ thống xử lý nước thải thông minh. Công nghệ này giúp tối ưu hóa quy trình xử lý, tiết kiệm đến 40% năng lượng tiêu thụ.</p>

                <p>Hệ thống AI bao gồm:</p>
                <ul>
                    <li>Thuật toán học máy dự đoán chất lượng nước</li>
                    <li>Tối ưu hóa liều lượng hóa chất</li>
                    <li>Tự động điều chỉnh quy trình xử lý</li>
                    <li>Giám sát và cảnh báo thời gian thực</li>
                </ul>

                <p>Lợi ích của công nghệ:</p>
                <ul>
                    <li>Tiết kiệm năng lượng đáng kể</li>
                    <li>Cải thiện hiệu quả xử lý</li>
                    <li>Giảm chi phí vận hành</li>
                    <li>Tăng độ tin cậy của hệ thống</li>
                </ul>

                <p>Hệ thống AI đã được áp dụng thành công tại nhiều nhà máy xử lý nước thải trên cả nước.</p>
            `
        },
        {
            title: 'ERATECH đạt chứng nhận ISO 14001:2015 về quản lý môi trường',
            excerpt: 'Chứng nhận quốc tế khẳng định cam kết của ERATECH trong việc bảo vệ môi trường và phát triển bền vững.',
            image: 'images/DJI_0581.jpg',
            date: '2023-12-05',
            category: 'Giải thưởng',
            content: `
                <p>ERATECH Group vinh dự đạt chứng nhận ISO 14001:2015 về hệ thống quản lý môi trường. Chứng nhận này khẳng định cam kết của công ty trong việc bảo vệ môi trường và phát triển bền vững.</p>

                <p>Chứng nhận ISO 14001:2015 bao gồm:</p>
                <ul>
                    <li>Cam kết lãnh đạo về môi trường</li>
                    <li>Đánh giá tác động môi trường</li>
                    <li>Quản lý rủi ro và cơ hội</li>
                    <li>Tuân thủ pháp luật và quy định</li>
                    <li>Cải tiến liên tục</li>
                </ul>

                <p>Lợi ích của chứng nhận:</p>
                <ul>
                    <li>Nâng cao uy tín thương hiệu</li>
                    <li>Tăng cường lòng tin khách hàng</li>
                    <li>Cải thiện hiệu quả hoạt động</li>
                    <li>Tuân thủ yêu cầu quốc tế</li>
                </ul>

                <p>ERATECH là một trong những doanh nghiệp đầu tiên trong ngành đạt chứng nhận này tại Việt Nam.</p>
            `
        },
        {
            title: 'Ký kết hợp đồng xuất khẩu công nghệ sang thị trường Đông Nam Á',
            excerpt: 'ERATECH chính thức xuất khẩu công nghệ xử lý môi trường sang 5 quốc gia trong khu vực Đông Nam Á.',
            image: 'images/DJI_0582.jpg',
            date: '2023-11-30',
            category: 'Hợp tác',
            content: `
                <p>ERATECH Group chính thức ký kết hợp đồng xuất khẩu công nghệ xử lý môi trường sang 5 quốc gia Đông Nam Á. Đây là bước ngoặt quan trọng trong việc mở rộng thị trường quốc tế.</p>

                <p>Các quốc gia đối tác:</p>
                <ul>
                    <li>Thái Lan</li>
                    <li>Indonesia</li>
                    <li>Malaysia</li>
                    <li>Philippines</li>
                    <li>Việt Nam (mở rộng)</li>
                </ul>

                <p>Công nghệ xuất khẩu:</p>
                <ul>
                    <li>Hệ thống xử lý nước thải công nghiệp</li>
                    <li>Công nghệ xử lý khí thải</li>
                    <li>Thiết bị giám sát môi trường</li>
                    <li>Giải pháp tái chế chất thải</li>
                </ul>

                <p>Giá trị hợp đồng đạt 100 triệu USD, tạo tiền đề cho việc mở rộng kinh doanh quốc tế của ERATECH.</p>
            `
        },
        {
            title: 'Đầu tư 150 tỷ đồng xây dựng trung tâm nghiên cứu xanh',
            excerpt: 'Trung tâm nghiên cứu mới sẽ tập trung vào các giải pháp công nghệ xanh và năng lượng tái tạo.',
            image: 'images/DJI_0583.jpg',
            date: '2023-11-25',
            category: 'Đầu tư',
            content: `
                <p>ERATECH Group đầu tư 150 tỷ đồng xây dựng Trung tâm Nghiên cứu Xanh tại TP.HCM. Trung tâm này sẽ tập trung vào nghiên cứu các giải pháp công nghệ xanh và năng lượng tái tạo.</p>

                <p>Trung tâm bao gồm:</p>
                <ul>
                    <li>Phòng thí nghiệm công nghệ xanh</li>
                    <li>Trung tâm nghiên cứu năng lượng tái tạo</li>
                    <li>Vườn ươm khởi nghiệp xanh</li>
                    <li>Trung tâm đào tạo và chuyển giao công nghệ</li>
                </ul>

                <p>Mục tiêu hoạt động:</p>
                <ul>
                    <li>Nghiên cứu công nghệ mới</li>
                    <li>Phát triển sản phẩm xanh</li>
                    <li>Hỗ trợ doanh nghiệp chuyển đổi xanh</li>
                    <li>Đào tạo nhân lực chuyên môn</li>
                </ul>

                <p>Trung tâm dự kiến đi vào hoạt động trong quý II/2024 và sẽ trở thành trung tâm nghiên cứu hàng đầu khu vực.</p>
            `
        },
        {
            title: 'Triển khai thành công hệ thống tái chế chất thải công nghiệp',
            excerpt: 'Công nghệ tái chế mới giúp chuyển đổi 90% chất thải công nghiệp thành nguyên liệu có thể tái sử dụng.',
            image: 'images/DJI_0584.jpg',
            date: '2023-11-20',
            category: 'Công nghệ',
            content: `
                <p>ERATECH Group triển khai thành công hệ thống tái chế chất thải công nghiệp với công nghệ tiên tiến. Hệ thống này giúp chuyển đổi 90% chất thải công nghiệp thành nguyên liệu có thể tái sử dụng.</p>

                <p>Công nghệ tái chế bao gồm:</p>
                <ul>
                    <li>Tái chế nhựa công nghiệp</li>
                    <li>Tái chế kim loại</li>
                    <li>Tái chế hóa chất</li>
                    <li>Tái chế chất thải điện tử</li>
                </ul>

                <p>Lợi ích của hệ thống:</p>
                <ul>
                    <li>Giảm thiểu chất thải ra môi trường</li>
                    <li>Tái sử dụng tài nguyên hiệu quả</li>
                    <li>Tiết kiệm chi phí xử lý</li>
                    <li>Tạo ra sản phẩm có giá trị</li>
                </ul>

                <p>Hệ thống đã được triển khai tại 20 khu công nghiệp và nhận được phản hồi tích cực từ các doanh nghiệp.</p>
            `
        },
        {
            title: 'Dự án xử lý nước thải tại Hà Nội hoàn thành giai đoạn đầu',
            excerpt: 'Dự án trị giá 250 tỷ đồng tại khu công nghiệp Bắc Thăng Long, xử lý 60.000 m³ nước thải/ngày.',
            image: 'images/DJI_0565.jpg',
            date: '2024-02-15',
            category: 'Dự án',
            content: `
                <p>ERATECH Group vừa hoàn thành giai đoạn đầu của dự án xử lý nước thải tại khu công nghiệp Bắc Thăng Long, Hà Nội với tổng trị giá 250 tỷ đồng. Dự án này phục vụ cho khu công nghiệp lớn tại phía Bắc, xử lý 60.000 m³ nước thải/ngày.</p>

                <p>Hệ thống xử lý sử dụng công nghệ màng lọc tiên tiến và oxy hóa tiên tiến (AOP). Dự án được thiết kế để đạt chuẩn xả thải nghiêm ngặt của EU và hỗ trợ phát triển bền vững khu vực.</p>

                <p>Ông Trần Minh H - Giám đốc dự án chia sẻ: "Dự án này không chỉ cải thiện môi trường mà còn cung cấp nguồn nước tái chế cho các doanh nghiệp, tiết kiệm 35% chi phí nước."</p>

                <p>Giai đoạn tiếp theo sẽ mở rộng công suất lên 90.000 m³/ngày vào quý IV/2024.</p>
            `
        },
        {
            title: 'Ứng dụng trí tuệ nhân tạo trong quản lý chất thải',
            excerpt: 'Hệ thống AI giúp phân loại và xử lý chất thải tự động, tăng hiệu quả 50%.',
            image: 'images/DJI_0566.jpg',
            date: '2024-02-10',
            category: 'Công nghệ',
            content: `
                <p>ERATECH Group triển khai thành công hệ thống trí tuệ nhân tạo (AI) trong quản lý và xử lý chất thải công nghiệp. Công nghệ này giúp phân loại tự động và tối ưu hóa quy trình xử lý, tăng hiệu quả lên đến 50%.</p>

                <p>Hệ thống AI sử dụng thuật toán học máy để nhận diện loại chất thải, dự đoán lượng phát sinh và tối ưu hóa quy trình xử lý. Công nghệ đặc biệt hữu ích cho các ngành công nghiệp nặng như hóa chất và điện tử.</p>

                <p>Ưu điểm chính:</p>
                <ul>
                    <li>Phân loại chính xác 95%</li>
                    <li>Giảm chi phí vận hành</li>
                    <li>Tự động hóa hoàn toàn</li>
                    <li>Giảm thiểu lỗi con người</li>
                </ul>

                <p>ERATECH đã áp dụng thành công tại 15 nhà máy và đang mở rộng ra toàn quốc.</p>
            `
        },
        {
            title: 'ERATECH nhận giải thưởng Sáng tạo Môi trường 2024',
            excerpt: 'Công ty được vinh danh với các giải pháp công nghệ xanh đột phá trong ngành môi trường.',
            image: 'images/DJI_0570.jpg',
            date: '2024-02-05',
            category: 'Giải thưởng',
            content: `
                <p>ERATECH Group vinh dự nhận giải thưởng "Sáng tạo Môi trường 2024" tại Diễn đàn Công nghệ Xanh Quốc gia. Đây là năm thứ 4 liên tiếp công ty được công nhận với những đóng góp xuất sắc.</p>

                <p>Giải thưởng được trao dựa trên các tiêu chí đổi mới công nghệ, hiệu quả xử lý và tác động môi trường. ERATECH được khen ngợi về hệ thống xử lý nước thải thông minh và công nghệ tái chế chất thải điện tử.</p>

                <p>Bà Nguyễn Thị I - Phó Tổng Giám đốc ERATECH chia sẻ: "Giải thưởng này là động lực để chúng tôi tiếp tục nghiên cứu và phát triển các công nghệ xanh, góp phần bảo vệ môi trường Việt Nam."</p>

                <p>ERATECH cam kết đầu tư thêm 300 tỷ đồng vào nghiên cứu công nghệ xanh trong năm 2024.</p>
            `
        },
        {
            title: 'Hợp tác với Tập đoàn GE về công nghệ lọc nước',
            excerpt: 'Thỏa thuận chuyển giao công nghệ lọc nước tiên tiến từ Mỹ, nâng cao chất lượng xử lý.',
            image: 'images/DJI_0576.jpg',
            date: '2024-01-30',
            category: 'Hợp tác',
            content: `
                <p>ERATECH Group ký kết thỏa thuận hợp tác chiến lược với Tập đoàn GE (Mỹ) về chuyển giao công nghệ lọc nước tiên tiến. Thỏa thuận này mở ra cơ hội nâng cao chất lượng xử lý nước thải tại Việt Nam.</p>

                <p>Hợp tác tập trung vào:</p>
                <ul>
                    <li>Chuyển giao công nghệ màng lọc nano</li>
                    <li>Đào tạo kỹ thuật viên</li>
                    <li>Nghiên cứu chung về công nghệ xanh</li>
                    <li>Đầu tư vào các dự án chung</li>
                </ul>

                <p>Ông John K - Giám đốc GE khu vực châu Á chia sẻ: "Việc hợp tác với ERATECH sẽ giúp chúng tôi mở rộng thị trường Đông Nam Á và góp phần giải quyết vấn đề nước sạch."</p>

                <p>Thỏa thuận có giá trị 50 triệu USD và kéo dài 5 năm.</p>
            `
        },
        {
            title: 'Đầu tư 180 tỷ đồng vào trung tâm tái chế chất thải',
            excerpt: 'Trung tâm mới tại Đồng Nai sẽ tái chế 100 tấn chất thải/ngày, tạo 300 việc làm.',
            image: 'images/DJI_0577.jpg',
            date: '2024-01-25',
            category: 'Đầu tư',
            content: `
                <p>ERATECH Group công bố đầu tư 180 tỷ đồng xây dựng Trung tâm Tái chế Chất thải tại Đồng Nai. Trung tâm này sẽ tái chế 100 tấn chất thải công nghiệp/ngày và tạo ra 300 việc làm.</p>

                <p>Trung tâm bao gồm:</p>
                <ul>
                    <li>Dây chuyền tái chế nhựa</li>
                    <li>Hệ thống tái chế kim loại</li>
                    <li>Công nghệ xử lý chất thải nguy hiểm</li>
                    <li>Kho bãi và logistics thông minh</li>
                </ul>

                <p>Mục tiêu:</p>
                <ul>
                    <li>Tái chế 80% chất thải khu vực</li>
                    <li>Giảm phát thải CO2</li>
                    <li>Tạo ra sản phẩm có giá trị từ chất thải</li>
                    <li>Phát triển ngành tái chế xanh</li>
                </ul>

                <p>Trung tâm dự kiến hoàn thành trong quý III/2024.</p>
            `
        },
        {
            title: 'Dự án giám sát chất lượng không khí tại TP.HCM',
            excerpt: 'Hệ thống 200 điểm giám sát thời gian thực, cảnh báo ô nhiễm kịp thời.',
            image: 'images/DJI_0578.jpg',
            date: '2024-01-20',
            category: 'Dự án',
            content: `
                <p>ERATECH Group triển khai dự án giám sát chất lượng không khí tại TP.HCM với 200 điểm giám sát thông minh. Hệ thống cung cấp dữ liệu thời gian thực và cảnh báo ô nhiễm kịp thời.</p>

                <p>Hệ thống bao gồm cảm biến PM2.5, NO2, SO2 và VOC, kết nối với trung tâm điều khiển. Dự án được đầu tư 120 tỷ đồng và giúp giảm 40% thời gian xử lý vi phạm.</p>

                <p>Ông Lê Văn L - Giám đốc dự án chia sẻ: "Hệ thống này giúp TP.HCM chủ động trong việc quản lý chất lượng không khí, bảo vệ sức khỏe người dân."</p>

                <p>Dự án đã được Sở Tài nguyên và Môi trường TP.HCM phê duyệt và triển khai từ tháng 12/2023.</p>
            `
        },
        {
            title: 'Công nghệ cảm biến thông minh cho hệ thống xử lý nước',
            excerpt: 'Cảm biến IoT tự động điều chỉnh quy trình xử lý, tiết kiệm 30% năng lượng.',
            image: 'images/DJI_0579.jpg',
            date: '2024-01-15',
            category: 'Công nghệ',
            content: `
                <p>ERATECH Group phát triển thành công công nghệ cảm biến thông minh cho hệ thống xử lý nước thải. Công nghệ này sử dụng IoT để tự động điều chỉnh quy trình, tiết kiệm đến 30% năng lượng tiêu thụ.</p>

                <p>Cảm biến thông minh đo pH, COD, BOD và TSS thời gian thực, gửi dữ liệu về trung tâm AI để tối ưu hóa liều lượng hóa chất và quy trình xử lý.</p>

                <p>Lợi ích:</p>
                <ul>
                    <li>Giảm chi phí hóa chất 25%</li>
                    <li>Tiết kiệm điện năng</li>
                    <li>Cải thiện chất lượng nước đầu ra</li>
                    <li>Giảm thiểu bảo trì</li>
                </ul>

                <p>Công nghệ đã được áp dụng tại 10 nhà máy xử lý nước và nhận được phản hồi tích cực.</p>
            `
        },
        {
            title: 'ERATECH đạt chứng nhận LEED Gold cho nhà máy xanh',
            excerpt: 'Nhà máy sản xuất thiết bị môi trường đạt tiêu chuẩn xanh quốc tế, tiết kiệm 50% năng lượng.',
            image: 'images/DJI_0580.jpg',
            date: '2024-01-10',
            category: 'Giải thưởng',
            content: `
                <p>ERATECH Group vinh dự đạt chứng nhận LEED Gold cho nhà máy sản xuất thiết bị môi trường tại Bình Dương. Đây là nhà máy xanh đầu tiên trong ngành đạt tiêu chuẩn quốc tế.</p>

                <p>Chứng nhận LEED Gold bao gồm:</p>
                <ul>
                    <li>Thiết kế xanh và tiết kiệm năng lượng</li>
                    <li>Sử dụng vật liệu thân thiện môi trường</li>
                    <li>Hệ thống nước mưa tái sử dụng</li>
                    <li>Giảm phát thải carbon</li>
                </ul>

                <p>Nhà máy tiết kiệm 50% năng lượng so với tiêu chuẩn thông thường và sử dụng 100% năng lượng tái tạo.</p>

                <p>Bà Trần Thị M - Giám đốc Nhà máy chia sẻ: "Chứng nhận này khẳng định cam kết của ERATECH trong phát triển bền vững."</p>
            `
        },
        {
            title: 'Hợp tác với Nhật Bản về công nghệ xử lý khí thải',
            excerpt: 'Thỏa thuận với Mitsubishi về chuyển giao công nghệ RTO tiên tiến.',
            image: 'images/DJI_0581.jpg',
            date: '2024-01-05',
            category: 'Hợp tác',
            content: `
                <p>ERATECH Group ký kết thỏa thuận hợp tác với Tập đoàn Mitsubishi (Nhật Bản) về công nghệ xử lý khí thải. Thỏa thuận tập trung vào chuyển giao công nghệ RTO tiên tiến.</p>

                <p>Hợp tác bao gồm:</p>
                <ul>
                    <li>Chuyển giao công nghệ oxy hóa nhiệt tái sinh</li>
                    <li>Đào tạo kỹ sư Nhật Bản</li>
                    <li>Nghiên cứu chung về giảm phát thải</li>
                    <li>Đầu tư vào dự án chung</li>
                </ul>

                <p>Ông Tanaka N - Giám đốc Mitsubishi Việt Nam cho biết: "Công nghệ của chúng tôi sẽ giúp Việt Nam giải quyết vấn đề ô nhiễm không khí hiệu quả hơn."</p>

                <p>Thỏa thuận có giá trị 80 triệu USD và kéo dài 7 năm.</p>
            `
        },
        {
            title: 'Đầu tư 220 tỷ đồng vào công nghệ năng lượng mặt trời',
            excerpt: 'Hệ thống điện mặt trời cho các nhà máy xử lý, cung cấp 70% điện năng tiêu thụ.',
            image: 'images/DJI_0582.jpg',
            date: '2023-12-28',
            category: 'Đầu tư',
            content: `
                <p>ERATECH Group đầu tư 220 tỷ đồng vào hệ thống năng lượng mặt trời cho các nhà máy xử lý môi trường. Dự án cung cấp 70% điện năng tiêu thụ cho các cơ sở sản xuất.</p>

                <p>Hệ thống bao gồm:</p>
                <ul>
                    <li>25.000 tấm pin mặt trời</li>
                    <li>Hệ thống lưu trữ năng lượng</li>
                    <li>Trung tâm điều khiển thông minh</li>
                    <li>Hệ thống giám sát hiệu suất</li>
                </ul>

                <p>Lợi ích:</p>
                <ul>
                    <li>Giảm chi phí điện 60%</li>
                    <li>Giảm phát thải CO2</li>
                    <li>Tăng tính tự chủ năng lượng</li>
                    <li>Hỗ trợ phát triển bền vững</li>
                </ul>

                <p>Dự án hoàn thành trong quý II/2024 và sẽ được nhân rộng ra các khu công nghiệp.</p>
            `
        },
        {
            title: 'Dự án xử lý chất thải y tế tại các bệnh viện',
            excerpt: 'Hệ thống xử lý chất thải y tế an toàn cho 50 bệnh viện, đầu tư 90 tỷ đồng.',
            image: 'images/DJI_0583.jpg',
            date: '2023-12-20',
            category: 'Dự án',
            content: `
                <p>ERATECH Group triển khai dự án xử lý chất thải y tế an toàn cho 50 bệnh viện trên cả nước. Dự án được đầu tư 90 tỷ đồng và đảm bảo xử lý 100% chất thải y tế theo quy định.</p>

                <p>Hệ thống sử dụng công nghệ hấp tự động và khử trùng bằng hơi nước, đạt chuẩn WHO. Dự án giúp giảm 95% nguy cơ lây nhiễm từ chất thải y tế.</p>

                <p>Bà Phạm Thị O - Giám đốc dự án chia sẻ: "Dự án này bảo vệ sức khỏe cộng đồng và nhân viên y tế, đồng thời tuân thủ nghiêm ngặt các quy định quốc tế."</p>

                <p>Dự án đã được Bộ Y tế phê duyệt và triển khai từ tháng 10/2023.</p>
            `
        },

        {

            title: 'Công nghệ blockchain trong quản lý dữ liệu môi trường',

            excerpt: 'Hệ thống blockchain đảm bảo tính minh bạch và bảo mật dữ liệu giám sát môi trường.',

            image: 'images/DJI_0584.jpg',

            date: '2023-12-15',

            category: 'Công nghệ',

            content: `

                <p>ERATECH Group áp dụng công nghệ blockchain trong quản lý dữ liệu giám sát môi trường. Công nghệ này đảm bảo tính minh bạch, bảo mật và không thể thay đổi dữ liệu.</p>

                <p>Hệ thống blockchain lưu trữ dữ liệu chất lượng không khí, nước thải và khí thải một cách phân tán, cho phép truy xuất lịch sử và xác thực tính toàn vẹn.</p>

                <p>Ứng dụng:</p>

                <ul>

                    <li>Giám sát minh bạch cho doanh nghiệp</li>

                    <li>Dữ liệu không thể giả mạo</li>

                    <li>Tích hợp với hệ thống quản lý</li>

                    <li>Hỗ trợ báo cáo tự động</li>

                </ul>

                <p>Công nghệ đã được thử nghiệm tại 5 khu công nghiệp và sẽ triển khai rộng rãi trong năm 2024.</p>

            `

        },

        {

            title: 'Dự án xử lý nước thải tại khu công nghiệp Đồng Nai',

            excerpt: 'Dự án mới trị giá 350 tỷ đồng, xử lý 70.000 m³ nước thải/ngày cho khu công nghiệp lớn.',

            image: 'images/DJI_0565.jpg',

            date: '2024-02-20',

            category: 'Dự án',

            content: `

                <p>ERATECH Group khởi công dự án xử lý nước thải tại khu công nghiệp Đồng Nai với tổng trị giá 350 tỷ đồng. Dự án phục vụ cho khu công nghiệp lớn tại miền Đông Nam Bộ, xử lý 70.000 m³ nước thải/ngày.</p>

                <p>Hệ thống sử dụng công nghệ lọc màng tiên tiến và oxy hóa tiên tiến (AOP), đảm bảo đạt chuẩn xả thải nghiêm ngặt của EU. Dự án được thiết kế để hỗ trợ phát triển bền vững và tái sử dụng nước.</p>

                <p>Ông Trần Văn K - Giám đốc dự án chia sẻ: "Dự án này không chỉ giải quyết vấn đề ô nhiễm mà còn cung cấp nguồn nước tái chế, tiết kiệm 40% chi phí cho doanh nghiệp."</p>

                <p>Giai đoạn 1 dự kiến hoàn thành trong quý III/2024.</p>

            `

        },

        {

            title: 'Ứng dụng AI trong dự báo chất lượng môi trường',

            excerpt: 'Hệ thống AI dự báo chính xác 95% về chất lượng không khí và nước thải.',

            image: 'images/DJI_0566.jpg',

            date: '2024-02-18',

            category: 'Công nghệ',

            content: `

                <p>ERATECH Group triển khai hệ thống trí tuệ nhân tạo (AI) tiên tiến để dự báo chất lượng môi trường. Hệ thống có khả năng dự báo chính xác lên đến 95% về chất lượng không khí và nước thải.</p>

                <p>Công nghệ sử dụng thuật toán học máy và dữ liệu lịch sử để phân tích xu hướng, giúp cơ quan quản lý môi trường chủ động trong việc phòng ngừa ô nhiễm.</p>

                <p>Lợi ích nổi bật:</p>

                <ul>

                    <li>Dự báo thời gian thực</li>

                    <li>Cảnh báo sớm vi phạm</li>

                    <li>Giảm chi phí giám sát</li>

                    <li>Hỗ trợ ra quyết định</li>

                </ul>

                <p>Hệ thống đã được áp dụng thử nghiệm tại TP.HCM và Hà Nội.</p>

            `

        },

        {

            title: 'ERATECH nhận giải thưởng Doanh nghiệp Xanh 2024',

            excerpt: 'Công ty được vinh danh với các sáng kiến công nghệ xanh và đóng góp cho môi trường.',

            image: 'images/DJI_0570.jpg',

            date: '2024-02-15',

            category: 'Giải thưởng',

            content: `

                <p>ERATECH Group vinh dự nhận giải thưởng "Doanh nghiệp Xanh 2024" tại Diễn đàn Phát triển Bền vững Quốc gia. Đây là năm thứ 5 liên tiếp công ty được công nhận với những đóng góp xuất sắc.</p>

                <p>Giải thưởng được trao dựa trên các tiêu chí đổi mới công nghệ, giảm phát thải và phát triển bền vững. ERATECH được khen ngợi về hệ thống xử lý nước thải thông minh và dự án năng lượng tái tạo.</p>

                <p>Bà Lê Thị L - Phó Tổng Giám đốc ERATECH chia sẻ: "Giải thưởng này là động lực để chúng tôi tiếp tục đầu tư vào công nghệ xanh, góp phần bảo vệ môi trường Việt Nam."</p>

                <p>ERATECH cam kết tăng đầu tư 20% vào nghiên cứu công nghệ xanh trong năm 2024.</p>

            `

        },

        {

            title: 'Hợp tác với Đại học Quốc gia Hà Nội về nghiên cứu môi trường',

            excerpt: 'Thỏa thuận hợp tác nghiên cứu công nghệ xử lý chất thải và đào tạo nhân lực chuyên môn.',

            image: 'images/DJI_0576.jpg',

            date: '2024-02-12',

            category: 'Hợp tác',

            content: `

                <p>ERATECH Group ký kết thỏa thuận hợp tác chiến lược với Đại học Quốc gia Hà Nội về nghiên cứu công nghệ môi trường. Thỏa thuận tập trung vào nghiên cứu xử lý chất thải và đào tạo nhân lực.</p>

                <p>Hợp tác bao gồm:</p>

                <ul>

                    <li>Nghiên cứu chung công nghệ xanh</li>

                    <li>Đào tạo kỹ sư môi trường</li>

                    <li>Chuyển giao công nghệ</li>

                    <li>Phát triển dự án chung</li>

                </ul>

                <p>GS.TS Nguyễn Văn M - Hiệu trưởng Đại học Quốc gia Hà Nội cho biết: "Việc hợp tác với ERATECH sẽ nâng cao chất lượng đào tạo và nghiên cứu trong lĩnh vực môi trường."</p>

                <p>Thỏa thuận có giá trị 100 triệu USD và kéo dài 5 năm.</p>

            `

        },

        {

            title: 'Đầu tư 250 tỷ đồng vào trung tâm nghiên cứu công nghệ tái chế',

            excerpt: 'Trung tâm mới tại TP.HCM sẽ tập trung vào tái chế chất thải điện tử và nhựa.',

            image: 'images/DJI_0577.jpg',

            date: '2024-02-10',

            category: 'Đầu tư',

            content: `

                <p>ERATECH Group công bố đầu tư 250 tỷ đồng xây dựng Trung tâm Nghiên cứu Công nghệ Tái chế tại TP.HCM. Trung tâm sẽ tập trung vào tái chế chất thải điện tử và nhựa.</p>

                <p>Trung tâm bao gồm phòng thí nghiệm tiên tiến, dây chuyền thử nghiệm và vườn ươm khởi nghiệp xanh. Dự án tạo ra 150 việc làm cho nghiên cứu viên và kỹ sư.</p>

                <p>Mục tiêu:</p>

                <ul>

                    <li>Tăng tỷ lệ tái chế lên 90%</li>

                    <li>Phát triển công nghệ mới</li>

                    <li>Hỗ trợ doanh nghiệp chuyển đổi xanh</li>

                    <li>Xuất khẩu công nghệ</li>

                </ul>

                <p>Trung tâm dự kiến hoàn thành trong quý IV/2024.</p>

            `

        },

        {

            title: 'Dự án giám sát không khí tại Hà Nội',

            excerpt: 'Hệ thống 150 điểm giám sát thời gian thực, giảm 50% thời gian xử lý vi phạm.',

            image: 'images/DJI_0578.jpg',

            date: '2024-02-08',

            category: 'Dự án',

            content: `

                <p>ERATECH Group triển khai dự án giám sát chất lượng không khí tại Hà Nội với 150 điểm giám sát thông minh. Hệ thống cung cấp dữ liệu thời gian thực và giảm 50% thời gian xử lý vi phạm.</p>

                <p>Hệ thống sử dụng cảm biến IoT và AI để phân tích dữ liệu, cảnh báo sớm ô nhiễm. Dự án được đầu tư 200 tỷ đồng và giúp bảo vệ sức khỏe người dân thủ đô.</p>

                <p>Ông Phạm Văn N - Giám đốc dự án chia sẻ: "Hệ thống này giúp Hà Nội chủ động trong quản lý chất lượng không khí, đặc biệt trong mùa khô."</p>

                <p>Dự án đã được Sở Tài nguyên và Môi trường Hà Nội phê duyệt.</p>

            `

        },

        {

            title: 'Công nghệ cảm biến IoT cho hệ thống xử lý nước',

            excerpt: 'Cảm biến thông minh tiết kiệm 35% năng lượng và cải thiện hiệu quả xử lý.',

            image: 'images/DJI_0579.jpg',

            date: '2024-02-05',

            category: 'Công nghệ',

            content: `

                <p>ERATECH Group phát triển công nghệ cảm biến IoT tiên tiến cho hệ thống xử lý nước thải. Công nghệ giúp tiết kiệm 35% năng lượng tiêu thụ và cải thiện hiệu quả xử lý.</p>

                <p>Cảm biến đo pH, COD và TSS thời gian thực, gửi dữ liệu về trung tâm điều khiển để tối ưu hóa quy trình. Công nghệ đặc biệt hiệu quả cho các nhà máy xử lý nước lớn.</p>

                <p>Lợi ích:</p>

                <ul>

                    <li>Giảm chi phí vận hành</li>

                    <li>Cải thiện chất lượng nước</li>

                    <li>Tự động hóa hoàn toàn</li>

                    <li>Giảm thiểu bảo trì</li>

                </ul>

                <p>Công nghệ đã được triển khai tại 12 nhà máy trên cả nước.</p>

            `

        }
            ];
            localStorage.setItem('newsArticles', JSON.stringify(newsData));
            return newsData;
        }
    }
    
    // Initialize news data on page load
    (async function initNews() {
        await loadNewsData();
        
        // Initialize news page if elements exist
        if (document.getElementById('news-articles-grid')) {
            initializeNewsPage();
        }
        
        // Load news for homepage
        if (newsContainer) {
            loadAllNews(newsContainer);
        }
    })();

    function loadAllNews(container) {
        if (!container) return;
        
        // Get latest 6 news articles
        const latestNews = newsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6);
        
        if (latestNews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Chưa có tin tức nào.</p>';
            return;
        }
        
        container.innerHTML = latestNews.map((article, index) => `
            <div class="news-card" data-aos="fade-up" data-aos-delay="${index * 100}" style="cursor: pointer;" onclick="window.location.href='news-detail-new.html?id=${article.id}'">
                <div class="news-card-image">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    <span class="news-card-category">${article.category}</span>
                </div>
                <div class="news-card-content">
                    <div class="news-card-meta">
                        <span><i class="far fa-calendar"></i> ${formatDateShort(article.date)}</span>
                    </div>
                    <h3 class="news-card-title">${article.title}</h3>
                    <p class="news-card-excerpt">${article.excerpt}</p>
                    <a href="news-detail-new.html?id=${article.id}" class="news-card-link" onclick="event.stopPropagation()">
                        Đọc thêm <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }
    
    function formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function loadNewsCarousel() {
        if (!newsGrid) return;

        const filteredData = filterNews();
        updateItemsPerSlide(); // Update items per slide based on screen size
        totalSlides = Math.ceil(filteredData.length / itemsPerSlide);
        currentNewsSlide = 0; // Reset to first slide

        showLoadingState(newsGrid);

        setTimeout(() => {
            newsGrid.innerHTML = '';
            if (filteredData.length === 0) {
                newsGrid.innerHTML = '<p>No news available</p>';
                hideLoadingState(newsGrid);
                return;
            }
            // Load all filtered news items into carousel
            for (let i = 0; i < filteredData.length; i++) {
                const article = filteredData[i];
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.setAttribute('data-aos', 'fade-up');
                newsItem.setAttribute('data-aos-delay', `${(i % 3) * 100}`);
                newsItem.innerHTML = `
                    <div class="news-image">
                        <img src="${article.image}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="news-content">
                        <div class="news-meta">
                            <span>${article.date}</span>
                            <span><i class="fas fa-tags"></i> ${article.category}</span>
                        </div>
                        <h3>${article.title}</h3>
                        <p>${article.excerpt}</p>
                        <a href="#" class="news-link">Đọc thêm <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                newsGrid.appendChild(newsItem);
            }

            // Update carousel indicators
            updateCarouselIndicators();

            // Update carousel buttons
            updateCarouselButtons();

            // Add scroll event listener to update indicators
            newsGrid.addEventListener('scroll', handleScroll);

            hideLoadingState(newsGrid);
        }, 300);
    }

    function updateCarouselIndicators() {
        if (!carouselIndicators) return;

        carouselIndicators.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${i === currentNewsSlide ? 'active' : ''}`;
            indicator.addEventListener('click', () => {
                currentNewsSlide = i;
                scrollToSlide(currentNewsSlide);
                updateCarouselIndicators();
                updateCarouselButtons();
            });
            carouselIndicators.appendChild(indicator);
        }
    }

    function updateCarouselButtons() {
        if (carouselPrev) {
            carouselPrev.disabled = currentNewsSlide === 0;
        }
        if (carouselNext) {
            carouselNext.disabled = currentNewsSlide === totalSlides - 1;
        }
    }

    function scrollToSlide(slideIndex) {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) return;

        const slideWidth = newsGrid.offsetWidth / itemsPerSlide;
        const scrollPosition = slideIndex * slideWidth * itemsPerSlide;

        newsGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    // Handle scroll events to update current slide
    function handleScroll() {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) return;

        const scrollLeft = newsGrid.scrollLeft;
        const slideWidth = newsGrid.offsetWidth / itemsPerSlide;
        const newSlide = Math.round(scrollLeft / (slideWidth * itemsPerSlide));

        if (newSlide !== currentNewsSlide) {
            currentNewsSlide = newSlide;
            updateCarouselIndicators();
            updateCarouselButtons();
        }
    }



    // News filtering functionality
    function filterNews() {
        return [];
    }

    // Load filtered news for carousel
    function loadFilteredNews() {
        loadNewsCarousel();
    }



    // News filter event listeners
    if (newsFilterBtns) {
        newsFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                newsFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter and reload
                currentFilter = btn.dataset.filter;
                loadFilteredNews();
            });
        });
    }

    // News search event listeners
    if (newsSearchInput && newsSearchBtn) {
        newsSearchBtn.addEventListener('click', () => {
            currentSearch = newsSearchInput.value;
            loadFilteredNews();
        });

        newsSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearch = newsSearchInput.value;
                loadFilteredNews();
            }
        });
    }

    // Carousel navigation event listeners
    if (carouselPrev) {
        carouselPrev.addEventListener('click', () => {
            if (currentNewsSlide > 0) {
                currentNewsSlide--;
                scrollToSlide(currentNewsSlide);
                updateCarouselIndicators();
                updateCarouselButtons();
            }
        });
    }

    if (carouselNext) {
        carouselNext.addEventListener('click', () => {
            if (currentNewsSlide < totalSlides - 1) {
                currentNewsSlide++;
                scrollToSlide(currentNewsSlide);
                updateCarouselIndicators();
                updateCarouselButtons();
            }
        });
    }

    // Window resize handler for carousel
    window.addEventListener('resize', () => {
        updateItemsPerSlide();
        loadFilteredNews(); // Reload to adjust carousel for new screen size
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Project Modal (Placeholder - would open lightbox or page)
    document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.dataset.project;
            alert(`Opening project details for ${projectId}`);
            // In real app: open modal or navigate to project page
        });
    });

    // Play button for video (Placeholder)
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const videoId = btn.dataset.video;
            alert(`Playing video: ${videoId}`);
            // In real app: open video modal
        });
    });

    // News Magazine Page Functionality
    const featuredArticleContainer = document.getElementById('featured-article');
    const newsArticlesGrid = document.getElementById('news-articles-grid');
    const newsLoading = document.getElementById('news-loading');
    const paginationControls = document.getElementById('pagination-controls');
    const pageNumbers = document.getElementById('page-numbers');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const magazineSearchInput = document.getElementById('news-search');
    const magazineFilterBtns = document.querySelectorAll('.filter-btn');

    // News state variables
    let magazineCurrentFilter = 'all';
    let magazineCurrentSearch = '';
    let magazineCurrentPage = 1;
    const magazineItemsPerPage = 6;
    let magazineTotalPages = 1;
    let magazineIsLoading = false;
    let magazineAllArticles = [];

    // Load featured article
    function loadFeaturedArticle() {
        if (!featuredArticleContainer) return;
        
        // Find all featured articles
        const featuredArticles = newsData.filter(article => article.featured);
        
        if (featuredArticles.length === 0) {
            featuredArticleContainer.innerHTML = '';
            return;
        }
        
        // Create slider HTML
        const slidesHTML = featuredArticles.map((article, index) => `
            <div class="featured-slide ${index === 0 ? 'active' : ''}" data-slide="${index}" data-article-id="${article.id}">
                <div class="featured-slide-image">
                    <img src="${article.image}" alt="${article.title}">
                    <div class="featured-slide-overlay"></div>
                </div>
                <div class="featured-slide-content">
                    <span class="featured-badge"><i class="fas fa-star"></i> Nổi bật</span>
                    <h2>${article.title}</h2>
                    <p>${article.excerpt}</p>
                    <a href="news-detail-new.html?id=${article.id}" class="btn btn-primary">
                        Đọc thêm <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `).join('');
        
        const dotsHTML = featuredArticles.map((_, index) => `
            <button class="featured-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
        `).join('');
        
        featuredArticleContainer.innerHTML = `
            <div class="featured-slider" data-aos="fade-up">
                <div class="featured-slides">
                    ${slidesHTML}
                </div>
                ${featuredArticles.length > 1 ? `
                    <button class="featured-nav featured-prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="featured-nav featured-next"><i class="fas fa-chevron-right"></i></button>
                    <div class="featured-dots">
                        ${dotsHTML}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Initialize slider if multiple featured articles
        if (featuredArticles.length > 1) {
            initFeaturedSlider();
        }
        
        // Add click handlers to slides
        document.querySelectorAll('.featured-slide').forEach(slide => {
            slide.addEventListener('click', function(e) {
                // Don't navigate if clicking on button or nav arrows
                if (e.target.closest('.btn-primary') || e.target.closest('.featured-nav') || e.target.closest('.featured-dot')) return;
                const articleId = this.getAttribute('data-article-id');
                window.location.href = `news-detail-new.html?id=${articleId}`;
            });
        });
    }
    
    // Initialize featured slider
    function initFeaturedSlider() {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.featured-slide');
        const dots = document.querySelectorAll('.featured-dot');
        const prevBtn = document.querySelector('.featured-prev');
        const nextBtn = document.querySelector('.featured-next');
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            if (index >= slides.length) currentSlide = 0;
            if (index < 0) currentSlide = slides.length - 1;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }
        
        function nextSlide() {
            currentSlide++;
            if (currentSlide >= slides.length) currentSlide = 0;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide--;
            if (currentSlide < 0) currentSlide = slides.length - 1;
            showSlide(currentSlide);
        }
        
        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        
        // Auto slide every 5 seconds
        setInterval(nextSlide, 5000);
    }
    
    // Format date to Vietnamese
    function formatVietnameseDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Load news articles grid
    function loadNewsArticles(loadMore = false) {
        if (!newsArticlesGrid || magazineIsLoading) return;

        magazineIsLoading = true;
        showNewsLoading();

        setTimeout(() => {
            const filteredData = filterNewsData();
            const startIndex = loadMore ? (magazineCurrentPage - 1) * magazineItemsPerPage : 0;
            const endIndex = Math.min(startIndex + magazineItemsPerPage, filteredData.length);

            if (!loadMore) {
                newsArticlesGrid.innerHTML = '';
                magazineCurrentPage = 1;
            }

            if (filteredData.length === 0) {
                newsArticlesGrid.innerHTML = '<p>No news available</p>';
                updateLoadMoreButton(0);
                hideNewsLoading();
                magazineIsLoading = false;
                return;
            }

            // Load articles
            for (let i = startIndex; i < endIndex; i++) {
                const article = filteredData[i];
                const articleCard = createNewsArticleCard(article, i);
                newsArticlesGrid.appendChild(articleCard);
            }

            // Update load more button
            updateLoadMoreButton(filteredData.length);

            hideNewsLoading();
            magazineIsLoading = false;
            AOS.refresh(); // Refresh AOS for new elements
        }, 500);
    }

    // Load magazine grid for news page
    function loadMagazineGrid(page = 1) {
        if (!newsArticlesGrid) return;

        const filteredData = filterNewsData();
        magazineCurrentPage = page;
        const totalPages = Math.ceil(filteredData.length / magazineItemsPerPage);

        // Ensure page is within bounds
        if (magazineCurrentPage < 1) magazineCurrentPage = 1;
        if (magazineCurrentPage > totalPages) magazineCurrentPage = totalPages;

        showNewsLoading();

        setTimeout(() => {
            newsArticlesGrid.innerHTML = '';

            if (filteredData.length === 0) {
                newsArticlesGrid.innerHTML = '<p>No news available</p>';
                updatePaginationControls(0);
                hideNewsLoading();
                return;
            }

            // Calculate start and end indices for current page
            const startIndex = (magazineCurrentPage - 1) * magazineItemsPerPage;
            const endIndex = Math.min(startIndex + magazineItemsPerPage, filteredData.length);

            // Load articles for current page only
            for (let i = startIndex; i < endIndex; i++) {
                const article = filteredData[i];
                const articleCard = createNewsArticleCard(article, i);
                newsArticlesGrid.appendChild(articleCard);
            }

            // Update pagination controls
            updatePaginationControls(filteredData.length);

            hideNewsLoading();
            AOS.refresh();
        }, 300);
    }

    // Update pagination controls with improved design
    function updatePaginationControls(totalItems) {
        if (!paginationControls || !prevPageBtn || !nextPageBtn || !pageNumbers) return;

        const totalPages = Math.ceil(totalItems / magazineItemsPerPage);

        // Clear existing page numbers
        pageNumbers.innerHTML = '';

        // Add page info
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Trang ${magazineCurrentPage} / ${totalPages}`;
        pageNumbers.appendChild(pageInfo);

        if (totalPages <= 6) {
            // Show all pages if 6 or fewer
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `btn btn-outline page-number ${i === magazineCurrentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => loadMagazineGrid(i));
                pageNumbers.appendChild(pageBtn);
            }
        } else {
            // Show pages 1-6, ellipsis, and last page
            // Show pages 1 through 6
            for (let i = 1; i <= 6; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `btn btn-outline page-number ${i === magazineCurrentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => loadMagazineGrid(i));
                pageNumbers.appendChild(pageBtn);
            }

            // Show ellipsis if totalPages > 6
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);

            // Always show last page
            const lastBtn = document.createElement('button');
            lastBtn.className = 'btn btn-outline page-number';
            lastBtn.textContent = totalPages;
            lastBtn.addEventListener('click', () => loadMagazineGrid(totalPages));
            pageNumbers.appendChild(lastBtn);
        }

        // Update button states
        prevPageBtn.disabled = magazineCurrentPage === 1;
        nextPageBtn.disabled = magazineCurrentPage === totalPages;

        // Show/hide pagination if only one page
        paginationControls.style.display = totalPages > 1 ? 'flex' : 'none';
    }

    // Create news article card
    function createNewsArticleCard(article, index) {
        const articleCard = document.createElement('div');
        articleCard.className = 'news-article-card';
        articleCard.setAttribute('data-aos', 'fade-up');
        articleCard.setAttribute('data-aos-delay', `${(index % 3) * 100}`);
        articleCard.style.cursor = 'pointer';

        articleCard.innerHTML = `
            <div class="news-article-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy">
            </div>
            <div class="news-article-content">
                <span class="news-article-category">${article.category}</span>
                <h3>${article.title}</h3>
                <div class="news-article-meta">
                    <span><i class="far fa-calendar"></i> ${article.date}</span>
                    <span><i class="fas fa-clock"></i> 5 phút đọc</span>
                </div>
                <p class="news-article-excerpt">${article.excerpt}</p>
                <a href="news-detail-new.html?id=${article.id}" class="news-article-link">
                    <span>Đọc thêm</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        // Add click handler to entire card
        articleCard.addEventListener('click', function(e) {
            // Don't navigate if clicking on the link itself
            if (e.target.closest('.news-article-link')) return;
            window.location.href = `news-detail-new.html?id=${article.id}`;
        });

        return articleCard;
    }

    // Filter news data
    function filterNewsData() {
        let filtered = [...newsData];
        
        // Filter by category
        if (magazineCurrentFilter && magazineCurrentFilter !== 'all') {
            filtered = filtered.filter(article => article.category === magazineCurrentFilter);
        }
        
        // Filter by search term
        if (magazineCurrentSearch) {
            const searchLower = magazineCurrentSearch.toLowerCase();
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(searchLower) ||
                article.excerpt.toLowerCase().includes(searchLower) ||
                article.category.toLowerCase().includes(searchLower)
            );
        }
        
        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return filtered;
    }

    // Update load more button
    function updateLoadMoreButton(totalItems) {
        if (!loadMoreBtn) return;

        const filteredData = filterNewsData();
        const hasMore = (magazineCurrentPage * magazineItemsPerPage) < filteredData.length;

        if (hasMore) {
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Show/hide loading state
    function showNewsLoading() {
        if (newsLoading) {
            newsLoading.style.display = 'block';
        }
    }

    function hideNewsLoading() {
        if (newsLoading) {
            newsLoading.style.display = 'none';
        }
    }

    // Load more articles
    function loadMoreArticles() {
        magazineCurrentPage++;
        loadNewsArticles(true);
    }

    // Initialize news page
    function initializeNewsPage() {
        if (document.getElementById('news-articles-grid')) {
            // Clear static HTML news cards and load dynamically
            const newsGrid = document.getElementById('news-grid');
            if (newsGrid) {
                newsGrid.innerHTML = ''; // Clear static content
            }

            loadFeaturedArticle();
            loadMagazineGrid(); // Use the new magazine grid loader

            // Filter button event listeners
            magazineFilterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    magazineFilterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    magazineCurrentFilter = btn.dataset.filter;
                    magazineCurrentPage = 1;
                    loadMagazineGrid(); // Use magazine grid loader
                });
            });

            // Search functionality
            if (magazineSearchInput) {
                let searchTimeout;
                magazineSearchInput.addEventListener('input', () => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        magazineCurrentSearch = magazineSearchInput.value;
                        magazineCurrentPage = 1;
                        loadMagazineGrid(); // Use magazine grid loader
                    }, 300);
                });
            }

            // Load more button
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', loadMoreArticles);
            }

            // Pagination event listeners
            if (prevPageBtn) {
                prevPageBtn.addEventListener('click', () => {
                    if (magazineCurrentPage > 1) {
                        loadMagazineGrid(magazineCurrentPage - 1);
                    }
                });
            }

            if (nextPageBtn) {
                nextPageBtn.addEventListener('click', () => {
                    const totalPages = Math.ceil(filterNewsData().length / magazineItemsPerPage);
                    if (magazineCurrentPage < totalPages) {
                        loadMagazineGrid(magazineCurrentPage + 1);
                    }
                });
            }
        }
    }

    // News Categories Functionality
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;

            // Update active category card
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // Set current filter to match category
            magazineCurrentFilter = category;

            // Reset search and page
            magazineCurrentSearch = '';
            magazineCurrentPage = 1;

            // Clear search input
            if (magazineSearchInput) {
                magazineSearchInput.value = '';
            }

            // Update filter tabs to match
            magazineFilterBtns.forEach(btn => {
                if (btn.dataset.filter === magazineCurrentFilter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Reload news grid
            loadMagazineGrid();

            // Smooth scroll to news grid
            const newsGridSection = document.querySelector('.news-main');
            if (newsGridSection) {
                newsGridSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize news page functionality
    initializeNewsPage();
    
    // Load services for home page
    if (document.getElementById('home-services-grid')) {
        loadHomeServices();
    }

});


// DISABLED - Window resize handler for mobile menu to prevent auto-closing
/*
window.addEventListener('resize', () => {
    const navBar = document.querySelector('.nav-bar');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    if (window.innerWidth > 768) {
        if (navBar) navBar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (mobileToggle) {
            mobileToggle.classList.remove('active');
        }
        // Close all dropdowns
        document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
            item.classList.remove('dropdown-open');
        });
    }
});
*/


// ============================================
// HOME PAGE SERVICES LOADING
// ============================================

// Load services for home page
function loadHomeServices() {
    const servicesGrid = document.getElementById('home-services-grid');
    if (!servicesGrid) {
        return;
    }

    
    // Try to load from localStorage first (for admin updates)
    const stored = localStorage.getItem('services');
    if (stored) {
        try {
            const services = JSON.parse(stored);
            displayHomeServices(services);
            return;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }
    
    // Fallback to JSON file if localStorage is empty
    loadServicesFromJSON();
}

// Load services from JSON file
function loadServicesFromJSON() {
    fetch('data/services-data.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data && data.services) {
                // Save to localStorage for future use
                localStorage.setItem('services', JSON.stringify(data.services));
                displayHomeServices(data.services);
            } else {
                console.error('Invalid data structure');
            }
        })
        .catch(error => {
            console.error('Error loading services:', error);
            // Show fallback content
            const servicesGrid = document.getElementById('home-services-grid');
            if (servicesGrid) {
                servicesGrid.innerHTML = `
                    <div class="service-card" data-aos="fade-up">
                        <div class="service-content" style="text-align: center; padding: 40px;">
                            <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #999; margin-bottom: 15px;"></i>
                            <p style="color: #666;">Không thể tải dịch vụ. Vui lòng thử lại sau.</p>
                        </div>
                    </div>
                `;
            }
        });
}

// Display services on home page (show max 3 services)
function displayHomeServices(services) {
    const servicesGrid = document.getElementById('home-services-grid');
    
    if (!servicesGrid) {
        console.error('Services grid not found!');
        return;
    }
    
    if (!services || services.length === 0) {
        console.error('No services to display');
        return;
    }

    // Get featured services first, then others, limit to 3
    const featuredServices = services.filter(s => s.featured);
    const otherServices = services.filter(s => !s.featured);
    const displayServices = [...featuredServices, ...otherServices].slice(0, 3);
    

    // Service icons mapping
    const iconMap = {
        'Xử lý nước thải': 'fa-tint',
        'Xử lý nước cấp': 'fa-water',
        'Xử lý khí thải': 'fa-wind',
        'Tư vấn': 'fa-comments',
        'Thiết kế': 'fa-drafting-compass',
        'Thi công': 'fa-hard-hat',
        'Vận hành': 'fa-cogs',
        'Bảo trì': 'fa-tools'
    };

    const html = displayServices.map((service, index) => {
        const icon = iconMap[service.category] || 'fa-cogs';
        const delay = (index + 1) * 100;
        
        
        return `
            <div class="service-card" data-aos="fade-up" data-aos-delay="${delay}" onclick="window.location.href='service-detail.html?id=${service.id}'" style="cursor: pointer;">
                <div class="service-image">
                    <img src="${service.image}" alt="${service.title}" onerror="console.error('Image failed to load: ${service.image}'); this.src='images/DJI_0565.jpg';">
                    <div class="service-overlay">
                        <div class="service-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                    </div>
                </div>
                <div class="service-content">
                    <h3>${service.title}</h3>
                    <p>${service.excerpt}</p>
                    <a href="service-detail.html?id=${service.id}" class="service-link" onclick="event.stopPropagation();">
                        Tìm hiểu thêm <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    servicesGrid.innerHTML = html;

    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Note: Services loading is initialized in the main DOMContentLoaded event listener above


// ============================================
// HOME PAGE PROJECTS LOADING
// ============================================

// Load projects for home page
function loadHomeProjects() {
    const projectsGallery = document.getElementById('home-projects-gallery');
    
    if (!projectsGallery) {
        return;
    }

    // Always load from JSON to ensure fresh data
    fetch('data/projects-data.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data && data.projects) {
                displayHomeProjects(data.projects);
                initializeProjectsFilter();
            } else {
                console.error('Invalid projects data structure');
            }
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            projectsGallery.innerHTML = `
                <div class="project-item" data-aos="fade-up">
                    <div class="project-overlay" style="position: relative; background: #f5f5f5; padding: 40px; text-align: center;">
                        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #999; margin-bottom: 15px;"></i>
                        <p style="color: #666;">Không thể tải dự án. Vui lòng thử lại sau.</p>
                    </div>
                </div>
            `;
        });
}

// Initialize projects filter
let allProjects = [];

function initializeProjectsFilter() {
    const filterBtns = document.querySelectorAll('.projects-filter .filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.dataset.filter;
            
            // Re-display projects with filter
            displayHomeProjects(allProjects, filter);
        });
    });
}

// Display projects on home page (show max 6 projects)
function displayHomeProjects(projects, filter = 'all') {
    allProjects = projects; // Store for filtering
    
    const projectsGallery = document.getElementById('home-projects-gallery');
    
    if (!projectsGallery) {
        console.error('Projects gallery not found!');
        return;
    }
    
    if (!projects || projects.length === 0) {
        console.error('No projects to display');
        return;
    }

    // Filter projects
    let filteredProjects = projects;
    if (filter !== 'all') {
        filteredProjects = projects.filter(p => p.category === filter);
    }
    
    // Sort by date (newest first) and limit to 6
    const displayProjects = filteredProjects
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
    

    // Status badge colors and icons
    const statusConfig = {
        'Hoàn thành': { color: '#28a745', icon: 'fa-check-circle' },
        'Đang thực hiện': { color: '#ffc107', icon: 'fa-spinner' },
        'Sắp triển khai': { color: '#17a2b8', icon: 'fa-clock' }
    };

    const html = displayProjects.map((project, index) => {
        const delay = (index + 1) * 100;
        const config = statusConfig[project.status] || { color: '#6c757d', icon: 'fa-info-circle' };
        
        
        return `
            <div class="project-item" data-category="${project.category}" data-aos="fade-up" data-aos-delay="${delay}" onclick="window.location.href='project-detail.html?id=${project.id}'" style="cursor: pointer;">
                <div class="project-image">
                    <img src="${project.image}" 
                         alt="${project.title}" 
                         onerror="console.error('Image failed to load: ${project.image}'); this.src='images/DJI_0565.jpg';">
                    <span class="project-status-badge" style="background: ${config.color};">
                        <i class="fas ${config.icon}"></i>
                        ${project.status}
                    </span>
                </div>
                <div class="project-overlay">
                    <div class="project-info">
                        <h4>${project.title}</h4>
                        <p style="margin: 10px 0;">
                            <i class="fas fa-map-marker-alt"></i> ${project.location}
                        </p>
                        <p>${project.excerpt}</p>
                    </div>
                    <a href="project-detail.html?id=${project.id}" class="view-project-btn-icon" title="Xem chi tiết" onclick="event.stopPropagation();">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    projectsGallery.innerHTML = html;

    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Initialize projects loading when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only load projects if we're on the home page
    if (document.getElementById('home-projects-gallery')) {
        loadHomeProjects();
    }
});


// ============================================
// MOBILE MENU - COMPLETE REWRITE
// ============================================
// DISABLED - Using mobile-menu-fix.js instead
/*
window.addEventListener('includesLoaded', function() {
    initMobileMenu();
});

setTimeout(initMobileMenu, 500);
*/

function initMobileMenu() {
    // DISABLED - Using mobile-menu-fix.js instead
    return;
    
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navBar = document.querySelector('.nav-bar');
    
    if (!mobileToggle || !navBar || navBar.dataset.initialized) return;
    navBar.dataset.initialized = 'true';
    
    // Create overlay
    let overlay = document.querySelector('.mobile-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }
    
    // Create close button
    if (!navBar.querySelector('.mobile-close')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        navBar.insertBefore(closeBtn, navBar.firstChild);
        
        closeBtn.addEventListener('click', closeMenu);
    }
    
    // Toggle menu
    mobileToggle.addEventListener('click', function(e) {
        e.preventDefault();
        if (navBar.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // DISABLED - Close on overlay click to prevent auto-closing
    /*
    overlay.addEventListener('click', function(e) {
        // Only close if clicking directly on overlay, not nav-bar
        if (e.target === overlay) {
            closeMenu();
        }
    });
    */
    
    // Arrow click for dropdown
    document.querySelectorAll('.nav-item.has-dropdown .arrow').forEach(arrow => {
        arrow.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const navItem = this.closest('.nav-item');
            navItem.classList.toggle('dropdown-open');
        });
    });
    
    // Handle menu link clicks - DISABLED to avoid conflict with new navigation handler
    /*
    navBar.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        // If clicking on arrow, toggle dropdown
        if (e.target.classList.contains('arrow') || e.target.closest('.arrow')) {
            e.preventDefault();
            e.stopPropagation();
            const navItem = e.target.closest('.nav-item');
            if (navItem) navItem.classList.toggle('dropdown-open');
            return;
        }
        
        // Get href and navigate
        const href = link.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = href;
        }
    }, true); // Use capture phase
    */
    
    function openMenu() {
        navBar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        navBar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.querySelectorAll('.nav-item.dropdown-open').forEach(item => {
            item.classList.remove('dropdown-open');
        });
    }
}

// ===== STICKY HEADER FUNCTIONALITY =====
(function initStickyHeader() {
    let header = document.querySelector('.header');
    let retryCount = 0;
    const maxRetries = 50;
    
    function setupStickyHeader() {
        header = document.querySelector('.header');
        
        if (!header) {
            retryCount++;
            if (retryCount < maxRetries) {
                setTimeout(setupStickyHeader, 100);
            }
            return;
        }
        
        
        let lastScrollTop = 0;
        let isSticky = false;
        
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add sticky class when scrolled down more than 100px
            if (scrollTop > 100) {
                if (!isSticky) {
                    header.classList.add('sticky');
                    isSticky = true;
                }
            } else {
                if (isSticky) {
                    header.classList.remove('sticky');
                    isSticky = false;
                }
            }
            
            lastScrollTop = scrollTop;
        }
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Check initial scroll position
        handleScroll();
    }
    
    // Start setup
    setupStickyHeader();
    
    // Also listen for includes loaded event
    window.addEventListener('includesLoaded', () => {
        setTimeout(setupStickyHeader, 100);
    });
})();
// Mobile menu is handled by js/mobile-menu.js
