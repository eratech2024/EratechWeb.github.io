// Recruitment Display Logic
let jobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 6;

// API Base URL
const RECRUITMENT_API_BASE = 'http://localhost:3000';

// Load jobs from API or localStorage
async function loadJobs() {
    // Try to load from API first
    try {
        const response = await fetch(RECRUITMENT_API_BASE + '/api/get-data/recruitment');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.jobs) {
                jobs = result.data.jobs;
                console.log('Jobs loaded from API');
                displayJobs();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('jobs');
    if (stored) {
        try {
            jobs = JSON.parse(stored);
            displayJobs();
            return;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }
    
    // Fallback to JSON file
    try {
        const response = await fetch('data/recruitment-data.json');
        const data = await response.json();
        jobs = data.jobs;
        displayJobs();
    } catch (error) {
        console.error('Error loading jobs:', error);
        jobs = [];
        displayJobs();
    }
}

// Current filters
let currentCategoryFilter = 'all';
let currentStatusFilter = 'all';

// Display jobs
function displayJobs(categoryFilter = 'all', statusFilter = 'all', searchTerm = '') {
    const grid = document.getElementById('jobs-grid');
    
    // Store current filters
    currentCategoryFilter = categoryFilter;
    currentStatusFilter = statusFilter;
    
    // Filter jobs
    filteredJobs = jobs.filter(job => {
        const isExpired = new Date(job.deadline) < new Date();
        
        const matchesCategory = categoryFilter === 'all' || job.department === categoryFilter;
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && !isExpired) ||
            (statusFilter === 'expired' && isExpired);
        const matchesSearch = searchTerm === '' || 
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesStatus && matchesSearch;
    });
    
    // Sort by date (newest first)
    filteredJobs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredJobs.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Không tìm thấy vị trí tuyển dụng nào.</p>
            </div>
        `;
        document.getElementById('pagination-controls').style.display = 'none';
        return;
    }
    
    // Reset to page 1 when filtering
    currentPage = 1;
    displayJobsPage();
    updatePagination(filteredJobs.length);
}

// Display jobs page
function displayJobsPage() {
    const grid = document.getElementById('jobs-grid');
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const jobsToDisplay = filteredJobs.slice(startIndex, endIndex);
    
    grid.innerHTML = jobsToDisplay.map((job, index) => {
        const isExpired = new Date(job.deadline) < new Date();
        const statusBadge = isExpired
            ? '<span class="job-status-badge expired"><i class="fas fa-times-circle"></i> Đã hết hạn</span>'
            : '<span class="job-status-badge active"><i class="fas fa-check-circle"></i> Đang tuyển</span>';
        
        return `
        <article class="news-article-card" data-aos="fade-up" data-aos-delay="${index * 50}" onclick="window.location.href='recruitment-detail.html?id=${job.id}'" style="cursor: pointer;">
            <div class="news-article-image">
                <img src="${job.image}" 
                     alt="${job.title}" 
                     onerror="this.src='images/DJI_0565.jpg';">
                ${statusBadge}
            </div>
            <div class="news-article-content">
                <span class="news-article-category">${job.department}</span>
                <h3>${job.title}</h3>
                <div class="news-article-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(job.date)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                </div>
                <p class="news-article-excerpt">${job.excerpt}</p>
                <a href="recruitment-detail.html?id=${job.id}" class="news-article-link" onclick="event.stopPropagation();">
                    Xem chi tiết <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </article>
        `;
    }).join('');
    
    // Scroll to top
    document.getElementById('jobs-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update pagination
function updatePagination(totalJobs) {
    const totalPages = Math.ceil(totalJobs / jobsPerPage);
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
        displayJobsPage();
        updatePagination(filteredJobs.length);
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
    loadJobs();
    
    // Check for department parameter in URL
    const deptParam = getURLParameter('department');
    if (deptParam) {
        setTimeout(() => {
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                if (btn.dataset.filter === deptParam) {
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
            
            const searchTerm = document.getElementById('jobs-search').value;
            displayJobs(categoryFilter, statusFilter, searchTerm);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('jobs-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            displayJobs(currentCategoryFilter, currentStatusFilter, this.value);
        });
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayJobsPage();
                updatePagination(filteredJobs.length);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayJobsPage();
                updatePagination(filteredJobs.length);
            }
        });
    }
});



