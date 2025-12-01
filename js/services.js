// Services Display Logic
let services = [];
let filteredServices = [];
let currentPage = 1;
const servicesPerPage = 6; // Số dịch vụ hiển thị mỗi trang

// API Base URL
const SERVICES_API_BASE = 'http://localhost:3000';

// Load services from API or localStorage
async function loadServices() {
    // Try to load from API first
    try {
        const response = await fetch(SERVICES_API_BASE + '/api/get-data/services');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.services) {
                services = result.data.services;
                console.log('Services loaded from API');
                displayServices();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('services');
    if (stored) {
        try {
            services = JSON.parse(stored);
            displayServices();
            return;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }
    
    // Fallback to JSON file if localStorage is empty
    try {
        const response = await fetch('data/services-data.json');
        const data = await response.json();
        services = data.services;
        displayServices();
    } catch (error) {
        console.error('Error loading services:', error);
        services = [];
        displayServices();
    }
}

// Display services
function displayServices(filter = 'all', searchTerm = '') {
    const grid = document.getElementById('services-grid');
    
    // Filter services
    filteredServices = services.filter(service => {
        const matchesFilter = filter === 'all' || service.category === filter;
        const matchesSearch = searchTerm === '' || 
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    // Sort by date (newest first)
    filteredServices.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredServices.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Không tìm thấy dịch vụ nào.</p>
            </div>
        `;
        updatePagination(0);
        return;
    }
    
    
    // Reset về trang 1 khi filter hoặc search
    currentPage = 1;
    
    // Hiển thị dịch vụ theo trang
    displayServicesPage();
    
    // Cập nhật phân trang
    updatePagination(filteredServices.length);
}

// Hiển thị dịch vụ theo trang
function displayServicesPage() {
    const grid = document.getElementById('services-grid');
    const startIndex = (currentPage - 1) * servicesPerPage;
    const endIndex = startIndex + servicesPerPage;
    const servicesToDisplay = filteredServices.slice(startIndex, endIndex);
    
    grid.innerHTML = servicesToDisplay.map((service, index) => {
        return `
        <article class="news-article-card news-article" data-aos="fade-up" onclick="window.location.href='service-detail.html?id=${service.id}'" style="cursor: pointer;">
            <div class="news-article-image">
                <img src="${service.image}" 
                     alt="${service.title}" 
                     onerror="this.src='images/DJI_0565.jpg';">
            </div>
            <div class="news-article-content">
                <span class="news-article-category">${service.category}</span>
                <h3>${service.title}</h3>
                <div class="news-article-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(service.date)}</span>
                    <span><i class="fas fa-user"></i> ${service.author}</span>
                </div>
                <p class="news-article-excerpt">${service.excerpt}</p>
                <a href="service-detail.html?id=${service.id}" class="news-article-link" onclick="event.stopPropagation();">
                    Xem chi tiết <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </article>
        `;
    }).join('');
    
    // Scroll to top of services section
    document.getElementById('services-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Cập nhật phân trang
function updatePagination(totalServices) {
    const totalPages = Math.ceil(totalServices / servicesPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    // Ẩn phân trang nếu chỉ có 1 trang hoặc không có dịch vụ
    const paginationControls = document.getElementById('pagination-controls');
    if (totalPages <= 1) {
        paginationControls.style.display = 'none';
        return;
    } else {
        paginationControls.style.display = 'flex';
    }
    
    // Cập nhật nút Previous
    prevBtn.disabled = currentPage === 1;
    
    // Cập nhật nút Next
    nextBtn.disabled = currentPage === totalPages;
    
    // Tạo số trang
    pageNumbers.innerHTML = '';
    
    // Logic hiển thị số trang (giống trang tin tức)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Nút trang đầu
    if (startPage > 1) {
        const firstPage = createPageButton(1);
        pageNumbers.appendChild(firstPage);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // Các trang ở giữa
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i);
        pageNumbers.appendChild(pageBtn);
    }
    
    // Nút trang cuối
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastPage = createPageButton(totalPages);
        pageNumbers.appendChild(lastPage);
    }
}

// Tạo nút trang
function createPageButton(pageNum) {
    const button = document.createElement('button');
    button.className = 'page-number';
    button.textContent = pageNum;
    
    if (pageNum === currentPage) {
        button.classList.add('active');
    }
    
    button.addEventListener('click', () => {
        currentPage = pageNum;
        displayServicesPage();
        updatePagination(filteredServices.length);
    });
    
    return button;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Force reload from localStorage (useful after admin updates)
function reloadFromLocalStorage() {
    const stored = localStorage.getItem('services');
    if (stored) {
        try {
            services = JSON.parse(stored);
            displayServices();
            return true;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
            return false;
        }
    }
    return false;
}

// Filter buttons
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    
    // Check for category parameter in URL
    const categoryParam = getURLParameter('category');
    if (categoryParam) {
        // Wait a bit for services to load, then apply filter
        setTimeout(() => {
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                if (btn.dataset.filter === categoryParam) {
                    btn.click();
                }
            });
        }, 500);
    }
    
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            const filter = this.dataset.filter;
            const searchTerm = document.getElementById('services-search').value;
            displayServices(filter, searchTerm);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('services-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            displayServices(activeFilter, this.value);
        });
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayServicesPage();
                updatePagination(filteredServices.length);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayServicesPage();
                updatePagination(filteredServices.length);
            }
        });
    }
});
