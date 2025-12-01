// Projects Display Logic
let projects = [];
let filteredProjects = [];
let currentPage = 1;
const projectsPerPage = 6;

// API Base URL
const PROJECTS_API_BASE = 'http://localhost:3000';

// Load projects from API or localStorage
async function loadProjects() {
    // Try to load from API first
    try {
        const response = await fetch(PROJECTS_API_BASE + '/api/get-data/projects');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.projects) {
                projects = result.data.projects;
                console.log('Projects loaded from API');
                displayProjects();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('projects');
    if (stored) {
        try {
            projects = JSON.parse(stored);
            displayProjects();
            return;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }
    
    // Fallback to JSON file
    try {
        const response = await fetch('data/projects-data.json');
        const data = await response.json();
        projects = data.projects;
        displayProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
        projects = [];
        displayProjects();
    }
}

// Display projects
function displayProjects(filter = 'all', searchTerm = '') {
    const grid = document.getElementById('projects-grid');
    
    // Filter projects
    filteredProjects = projects.filter(project => {
        const matchesFilter = filter === 'all' || 
                            project.category === filter || 
                            project.status === filter;
        const matchesSearch = searchTerm === '' || 
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    // Sort by date (newest first)
    filteredProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredProjects.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Không tìm thấy dự án nào.</p>
            </div>
        `;
        updatePagination(0);
        return;
    }
    
    
    // Reset to page 1
    currentPage = 1;
    displayProjectsPage();
    updatePagination(filteredProjects.length);
}

// Display projects page
function displayProjectsPage() {
    const grid = document.getElementById('projects-grid');
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const projectsToDisplay = filteredProjects.slice(startIndex, endIndex);
    
    grid.innerHTML = projectsToDisplay.map((project, index) => {
        const statusBadge = project.status === 'Hoàn thành' 
            ? '<span class="project-status-badge completed"><i class="fas fa-check-circle"></i> Hoàn thành</span>'
            : '<span class="project-status-badge ongoing"><i class="fas fa-spinner"></i> Đang thực hiện</span>';
        
        return `
        <article class="news-article-card news-article" data-aos="fade-up" onclick="window.location.href='project-detail.html?id=${project.id}'" style="cursor: pointer;">
            <div class="news-article-image">
                <img src="${project.image}" 
                     alt="${project.title}" 
                     onerror="this.src='images/DJI_0565.jpg';">
                ${statusBadge}
            </div>
            <div class="news-article-content">
                <span class="news-article-category">${project.category}</span>
                <h3>${project.title}</h3>
                <div class="news-article-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(project.date)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${project.location}</span>
                </div>
                <p class="news-article-excerpt">${project.excerpt}</p>
                <a href="project-detail.html?id=${project.id}" class="news-article-link" onclick="event.stopPropagation();">
                    Xem chi tiết <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </article>
        `;
    }).join('');
    
    // Scroll to top
    document.getElementById('projects-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update pagination
function updatePagination(totalProjects) {
    const totalPages = Math.ceil(totalProjects / projectsPerPage);
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
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i);
        pageNumbers.appendChild(pageBtn);
    }
    
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

// Create page button
function createPageButton(pageNum) {
    const button = document.createElement('button');
    button.className = 'page-number';
    button.textContent = pageNum;
    
    if (pageNum === currentPage) {
        button.classList.add('active');
    }
    
    button.addEventListener('click', () => {
        currentPage = pageNum;
        displayProjectsPage();
        updatePagination(filteredProjects.length);
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    
    // Check for status parameter in URL
    const statusParam = getURLParameter('status');
    if (statusParam) {
        setTimeout(() => {
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                if (btn.dataset.filter === statusParam) {
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
            const searchTerm = document.getElementById('projects-search').value;
            displayProjects(filter, searchTerm);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('projects-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            displayProjects(activeFilter, this.value);
        });
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayProjectsPage();
                updatePagination(filteredProjects.length);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayProjectsPage();
                updatePagination(filteredProjects.length);
            }
        });
    }
});
