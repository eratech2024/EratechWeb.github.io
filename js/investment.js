// Investment Display Logic
let investments = [];
let filteredInvestments = [];
let currentPage = 1;
const investmentsPerPage = 6;

// API Base URL
const INVESTMENT_API_BASE = 'http://localhost:3000';

// Load investments from API or localStorage
async function loadInvestments() {
    // Try to load from API first
    try {
        const response = await fetch(INVESTMENT_API_BASE + '/api/get-data/investment');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.investments) {
                investments = result.data.investments;
                console.log('Investments loaded from API');
                displayInvestments();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('investments');
    if (stored) {
        try {
            investments = JSON.parse(stored);
            displayInvestments();
            return;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }
    
    // Fallback to JSON file
    try {
        const response = await fetch('data/investment-data.json');
        const data = await response.json();
        investments = data.investments;
        displayInvestments();
    } catch (error) {
        console.error('Error loading investments:', error);
        investments = [];
        displayInvestments();
    }
}

// Current filters
let currentCategoryFilter = 'all';
let currentStatusFilter = 'all';

// Display investments
function displayInvestments(categoryFilter = 'all', statusFilter = 'all', searchTerm = '') {
    const grid = document.getElementById('investment-grid');
    
    // Store current filters
    currentCategoryFilter = categoryFilter;
    currentStatusFilter = statusFilter;
    
    // Filter investments
    filteredInvestments = investments.filter(investment => {
        const matchesCategory = categoryFilter === 'all' || investment.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && investment.status === 'Đang triển khai') ||
            (statusFilter === 'completed' && investment.status === 'Hoàn thành');
        const matchesSearch = searchTerm === '' || 
            investment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            investment.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            investment.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesStatus && matchesSearch;
    });
    
    // Sort by date (newest first)
    filteredInvestments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredInvestments.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Không tìm thấy dự án đầu tư nào.</p>
            </div>
        `;
        document.getElementById('pagination-controls').style.display = 'none';
        return;
    }
    
    // Reset to page 1 when filtering
    currentPage = 1;
    displayInvestmentsPage();
    updatePagination(filteredInvestments.length);
}

// Display investments page
function displayInvestmentsPage() {
    const grid = document.getElementById('investment-grid');
    const startIndex = (currentPage - 1) * investmentsPerPage;
    const endIndex = startIndex + investmentsPerPage;
    const investmentsToDisplay = filteredInvestments.slice(startIndex, endIndex);
    
    grid.innerHTML = investmentsToDisplay.map((investment, index) => {
        const statusClass = investment.status === 'Hoàn thành' ? 'completed' : 'active';
        const statusIcon = investment.status === 'Hoàn thành' ? 'fa-check-circle' : 'fa-spinner';
        const statusBadge = `<span class="job-status-badge ${statusClass}"><i class="fas ${statusIcon}"></i> ${investment.status}</span>`;
        
        return `
        <article class="news-article-card" data-aos="fade-up" data-aos-delay="${index * 50}" onclick="window.location.href='investment-detail.html?id=${investment.id}'" style="cursor: pointer;">
            <div class="news-article-image">
                <img src="${investment.image}" 
                     alt="${investment.title}" 
                     onerror="this.src='images/DJI_0565.jpg';">
                ${statusBadge}
                ${investment.progress ? `<div class="investment-progress"><div class="progress-bar" style="width: ${investment.progress}%"></div><span class="progress-text">${investment.progress}%</span></div>` : ''}
            </div>
            <div class="news-article-content">
                <span class="news-article-category">${investment.category}</span>
                <h3>${investment.title}</h3>
                <div class="news-article-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(investment.date)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${investment.location}</span>
                </div>
                <div class="investment-info">
                    <span><i class="fas fa-money-bill-wave"></i> ${investment.investmentAmount}</span>
                </div>
                <p class="news-article-excerpt">${investment.excerpt}</p>
                <a href="investment-detail.html?id=${investment.id}" class="news-article-link" onclick="event.stopPropagation();">
                    Xem chi tiết <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </article>
        `;
    }).join('');
    
    // Scroll to top
    document.getElementById('investment-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update pagination
function updatePagination(totalInvestments) {
    const totalPages = Math.ceil(totalInvestments / investmentsPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    const paginationControls = document.getElementById('pagination-controls');
    if (totalPages <= 1) {
        paginationControls.style.display = 'none';
        return;
    } else {
        paginationControls.style.display = 'flex';
    }
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    pageNumbers.innerHTML = '';
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        const firstPage = createPageButton(1);
        pageNumbers.appendChild(firstPage);
        
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'pagination-dots';
            pageNumbers.appendChild(dots);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i);
        pageNumbers.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'pagination-dots';
            pageNumbers.appendChild(dots);
        }
        
        const lastPage = createPageButton(totalPages);
        pageNumbers.appendChild(lastPage);
    }
}

// Create page button
function createPageButton(pageNum) {
    const btn = document.createElement('button');
    btn.textContent = pageNum;
    btn.className = 'page-number-btn';
    if (pageNum === currentPage) {
        btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
        currentPage = pageNum;
        displayInvestmentsPage();
        updatePagination(filteredInvestments.length);
    });
    return btn;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

// Get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadInvestments();
    
    // Check for category or status parameter in URL
    const categoryParam = getURLParameter('category');
    const statusParam = getURLParameter('status');
    
    if (categoryParam || statusParam) {
        setTimeout(() => {
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                if ((categoryParam && btn.dataset.filter === categoryParam) ||
                    (statusParam && btn.dataset.filter === statusParam)) {
                    btn.click();
                }
            });
        }, 500);
    }
    
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.dataset.type;
            
            // Remove active from same type buttons
            filterBtns.forEach(b => {
                if (b.dataset.type === filterType) {
                    b.classList.remove('active');
                }
            });
            
            // Add active to clicked button
            this.classList.add('active');
            
            // Get current filters
            let categoryFilter = 'all';
            let statusFilter = 'all';
            
            const activeCategoryBtn = document.querySelector('.filter-btn[data-type="category"].active');
            const activeStatusBtn = document.querySelector('.filter-btn[data-type="status"].active');
            
            if (activeCategoryBtn) {
                categoryFilter = activeCategoryBtn.dataset.filter;
            }
            if (activeStatusBtn) {
                statusFilter = activeStatusBtn.dataset.filter;
            }
            
            const searchTerm = document.getElementById('investment-search').value;
            displayInvestments(categoryFilter, statusFilter, searchTerm);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('investment-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            displayInvestments(currentCategoryFilter, currentStatusFilter, this.value);
        });
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayInvestmentsPage();
                updatePagination(filteredInvestments.length);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredInvestments.length / investmentsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayInvestmentsPage();
                updatePagination(filteredInvestments.length);
            }
        });
    }
});



