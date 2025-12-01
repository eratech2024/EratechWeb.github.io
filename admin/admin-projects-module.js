// Projects Management Module for Admin
let projectsData = [];
let editingProjectId = null;

// API Base URL
const PROJECTS_API_BASE = 'http://localhost:3000';

// Load projects
async function loadProjectsAdmin() {
    // Try to load from API first
    try {
        const response = await fetch(PROJECTS_API_BASE + '/api/get-data/projects');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.projects) {
                projectsData = result.data.projects;
                console.log('Projects loaded from API');
                displayProjectsAdmin();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('projects');
    if (stored) {
        projectsData = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('../data/projects-data.json');
            const data = await response.json();
            projectsData = data.projects;
            await saveProjects();
        } catch (error) {
            console.error('Error loading projects:', error);
            projectsData = [];
        }
    }
    displayProjectsAdmin();
}

// Save projects
async function saveProjects() {
    try {
        const dataStr = JSON.stringify(projectsData);
        const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
        console.log(`Projects data size: ${sizeInMB.toFixed(2)} MB`);
        
        let serverSaved = false;
        let localSaved = false;
        
        // Save to server via API
        try {
            const response = await fetch(PROJECTS_API_BASE + '/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'projects',
                    data: { projects: projectsData }
                })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Projects saved to server');
                serverSaved = true;
            }
        } catch (apiError) {
            console.warn('API save failed:', apiError.message);
        }
        
        // Also save to localStorage as backup
        try {
            if (sizeInMB <= 4) {
                localStorage.setItem('projects', dataStr);
                localSaved = true;
            }
        } catch (localError) {
            console.warn('localStorage save failed:', localError.message);
        }
        
        if (!serverSaved && !localSaved) {
            showAlert('Lỗi: Không thể lưu dữ liệu!', 'error');
            return false;
        }
        
        return true;
    } catch (e) {
        showAlert('Lỗi khi lưu dữ liệu: ' + e.message, 'error');
        return false;
    }
}

// Auto export
function autoExportProjectsJSON() {
    const dataStr = JSON.stringify({ projects: projectsData }, null, 2);
    console.log('Projects data ready for export');
}

// Display projects list
function displayProjectsAdmin() {
    const container = document.getElementById('projects-container');
    
    if (projectsData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Chưa có dự án nào.</p>
            </div>
        `;
        return;
    }
    
    const sortedProjects = [...projectsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedProjects.map(project => `
        <div class="article-item">
            <div class="article-header">
                <div>
                    <h3 class="article-title">${project.title}</h3>
                    ${project.status === 'Hoàn thành' ? '<span class="badge" style="background: #28a745;"><i class="fas fa-check-circle"></i> Hoàn thành</span>' : '<span class="badge" style="background: #ffc107; color: #333;"><i class="fas fa-spinner"></i> Đang thực hiện</span>'}
                </div>
            </div>
            <div class="article-meta">
                <span><i class="fas fa-folder"></i> ${project.category}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(project.date)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${project.location}</span>
            </div>
            <p class="article-excerpt">${project.excerpt}</p>
            <div class="article-actions">
                <button class="btn btn-edit" onclick="editProject(${project.id})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-danger" onclick="deleteProject(${project.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `).join('');
}

// Handle project form submit
async function handleProjectFormSubmit(e) {
    e.preventDefault();
    
    syncProjectEditorContent();
    
    const content = document.getElementById('project-content').value;
    if (!content || content.trim() === '' || content.trim() === '<p>Nhập nội dung dự án tại đây...</p>') {
        showAlert('Vui lòng nhập nội dung dự án!', 'error');
        document.getElementById('project-editor').focus();
        return;
    }
    
    const formData = {
        id: editingProjectId || Date.now(),
        title: document.getElementById('project-title').value,
        category: document.getElementById('project-category').value,
        status: document.getElementById('project-status').value,
        date: document.getElementById('project-date').value,
        location: document.getElementById('project-location').value,
        image: document.getElementById('project-image').value,
        excerpt: document.getElementById('project-excerpt').value,
        content: content
    };
    
    if (editingProjectId) {
        const index = projectsData.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projectsData[index] = formData;
        }
    } else {
        projectsData.push(formData);
    }
    
    const saved = await saveProjects();
    if (!saved) return;
    
    displayProjectsAdmin();
    resetProjectForm();
    showAlert(editingProjectId ? 'Cập nhật dự án thành công!' : 'Thêm dự án mới thành công!', 'success');
    document.querySelector('.menu-item[data-tab="projects-list"]').click();
}

// Edit project
function editProject(id) {
    const project = projectsData.find(p => p.id === id);
    if (!project) return;
    
    editingProjectId = id;
    document.querySelector('.menu-item[data-tab="projects-new"]').click();
    
    setTimeout(() => {
        document.getElementById('project-form-title').textContent = 'Chỉnh sửa dự án';
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-status').value = project.status;
        document.getElementById('project-date').value = project.date;
        document.getElementById('project-location').value = project.location;
        document.getElementById('project-image').value = project.image;
        document.getElementById('project-excerpt').value = project.excerpt;
        document.getElementById('project-content').value = project.content;
        
        const editor = document.getElementById('project-editor');
        if (editor) {
            editor.innerHTML = project.content;
        }
        
        showImagePreview(project.image, 'project');
        showAlert(`Đang chỉnh sửa dự án: "${project.title}"`, 'success');
    }, 150);
}

// Delete project
async function deleteProject(id) {
    const project = projectsData.find(p => p.id === id);
    if (!project) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa dự án "${project.title}"?`)) return;
    
    projectsData = projectsData.filter(p => p.id !== id);
    await saveProjects();
    displayProjectsAdmin();
    showAlert(`Đã xóa dự án "${project.title}" thành công!`, 'success');
}

// Reset project form
function resetProjectForm() {
    editingProjectId = null;
    document.getElementById('project-form-title').textContent = 'Thêm dự án mới';
    document.getElementById('project-form').reset();
    document.getElementById('project-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('project-editor').innerHTML = '<p>Nhập nội dung dự án tại đây...</p>';
}

// Export projects data
function exportProjectsData() {
    const dataStr = JSON.stringify({ projects: projectsData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Đã xuất dữ liệu dự án thành công!');
}

// Sync project editor content
function syncProjectEditorContent() {
    const editor = document.getElementById('project-editor');
    const textarea = document.getElementById('project-content');
    
    if (!isProjectHTMLMode) {
        textarea.value = editor.innerHTML;
    }
}

// Format text in project editor
function formatProjectText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('project-editor').focus();
}

// Toggle HTML mode for projects
let isProjectHTMLMode = false;
function toggleProjectHTMLMode() {
    const editor = document.getElementById('project-editor');
    const textarea = document.getElementById('project-content');
    
    if (isProjectHTMLMode) {
        editor.innerHTML = textarea.value;
        editor.style.display = 'block';
        textarea.style.display = 'none';
        isProjectHTMLMode = false;
    } else {
        textarea.value = editor.innerHTML;
        editor.style.display = 'none';
        textarea.style.display = 'block';
        isProjectHTMLMode = true;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}
