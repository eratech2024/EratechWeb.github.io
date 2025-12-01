// Recruitment Management Module for Admin
let jobsData = [];
let editingJobId = null;

// API Base URL
const RECRUITMENT_API_BASE = 'http://localhost:3000';

// Load jobs
async function loadJobsAdmin() {
    // Try to load from API first
    try {
        const response = await fetch(RECRUITMENT_API_BASE + '/api/get-data/recruitment');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.jobs) {
                jobsData = result.data.jobs;
                console.log('Jobs loaded from API');
                displayJobsAdmin();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('jobs');
    if (stored) {
        jobsData = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('../data/recruitment-data.json');
            const data = await response.json();
            jobsData = data.jobs;
            await saveJobs();
        } catch (error) {
            console.error('Error loading jobs:', error);
            jobsData = [];
        }
    }
    displayJobsAdmin();
}

// Save jobs
async function saveJobs() {
    try {
        const dataStr = JSON.stringify(jobsData);
        const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
        console.log(`Jobs data size: ${sizeInMB.toFixed(2)} MB`);
        
        let serverSaved = false;
        let localSaved = false;
        
        // Save to server via API
        try {
            const response = await fetch(RECRUITMENT_API_BASE + '/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'recruitment',
                    data: { jobs: jobsData }
                })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Jobs saved to server');
                serverSaved = true;
            }
        } catch (apiError) {
            console.warn('API save failed:', apiError.message);
        }
        
        // Also save to localStorage as backup
        try {
            if (sizeInMB <= 4) {
                localStorage.setItem('jobs', dataStr);
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
function autoExportJobsJSON() {
    const dataStr = JSON.stringify({ jobs: jobsData }, null, 2);
    console.log('Jobs data ready for export');
}

// Display jobs list
function displayJobsAdmin() {
    const container = document.getElementById('jobs-container');
    
    if (jobsData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Chưa có tin tuyển dụng nào.</p>
            </div>
        `;
        return;
    }
    
    const sortedJobs = [...jobsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedJobs.map(job => {
        const isExpired = new Date(job.deadline) < new Date();
        const statusBadge = isExpired
            ? '<span class="badge" style="background: #dc3545;"><i class="fas fa-times-circle"></i> Hết hạn</span>'
            : '<span class="badge" style="background: #28a745;"><i class="fas fa-check-circle"></i> Đang tuyển</span>';
        
        return `
        <div class="article-item">
            <div class="article-header">
                <div>
                    <h3 class="article-title">${job.title}</h3>
                    ${statusBadge}
                    ${job.featured ? '<span class="badge badge-featured"><i class="fas fa-star"></i> Nổi bật</span>' : ''}
                </div>
            </div>
            <div class="article-meta">
                <span><i class="fas fa-folder"></i> ${job.department}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-money-bill-wave"></i> ${job.salary}</span>
                <span><i class="fas fa-clock"></i> Hạn: ${formatDate(job.deadline)}</span>
            </div>
            <p class="article-excerpt">${job.excerpt}</p>
            <div class="article-actions">
                <button class="btn btn-edit" onclick="editJob(${job.id})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-danger" onclick="deleteJob(${job.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `}).join('');
}

// Handle job form submit
async function handleJobFormSubmit(e) {
    e.preventDefault();
    
    syncJobEditorContent();
    
    const content = document.getElementById('job-content').value;
    if (!content || content.trim() === '' || content.trim() === '<p>Nhập nội dung tại đây...</p>') {
        showAlert('Vui lòng nhập nội dung tin tuyển dụng!', 'error');
        document.getElementById('job-editor').focus();
        return;
    }
    
    const formData = {
        id: editingJobId || Date.now(),
        title: document.getElementById('job-title').value,
        position: document.getElementById('job-position').value,
        department: document.getElementById('job-department').value,
        location: document.getElementById('job-location').value,
        type: document.getElementById('job-type').value,
        level: document.getElementById('job-level').value,
        salary: document.getElementById('job-salary').value,
        deadline: document.getElementById('job-deadline').value,
        date: document.getElementById('job-date').value,
        image: document.getElementById('job-image').value,
        excerpt: document.getElementById('job-excerpt').value,
        content: content,
        requirements: document.getElementById('job-requirements').value,
        benefits: document.getElementById('job-benefits').value,
        featured: document.getElementById('job-featured').checked
    };
    
    if (editingJobId) {
        const index = jobsData.findIndex(j => j.id === editingJobId);
        if (index !== -1) {
            jobsData[index] = formData;
        }
    } else {
        jobsData.push(formData);
    }
    
    const saved = await saveJobs();
    if (!saved) return;
    
    displayJobsAdmin();
    resetJobForm();
    showAlert(editingJobId ? 'Cập nhật tin tuyển dụng thành công!' : 'Thêm tin tuyển dụng mới thành công!', 'success');
    
    // Switch to jobs list tab
    setTimeout(() => {
        const jobsListTab = document.querySelector('.menu-item[data-tab="jobs-list"]');
        if (jobsListTab) {
            jobsListTab.click();
        }
    }, 100);
}

// Edit job
function editJob(id) {
    const job = jobsData.find(j => j.id === id);
    if (!job) return;
    
    editingJobId = id;
    document.querySelector('.menu-item[data-tab="jobs-new"]').click();
    
    setTimeout(() => {
        document.getElementById('job-form-title').textContent = 'Chỉnh sửa tin tuyển dụng';
        document.getElementById('job-title').value = job.title;
        document.getElementById('job-position').value = job.position;
        document.getElementById('job-department').value = job.department;
        document.getElementById('job-location').value = job.location;
        document.getElementById('job-type').value = job.type;
        document.getElementById('job-level').value = job.level;
        document.getElementById('job-salary').value = job.salary;
        document.getElementById('job-deadline').value = job.deadline;
        document.getElementById('job-date').value = job.date;
        document.getElementById('job-image').value = job.image;
        document.getElementById('job-excerpt').value = job.excerpt;
        document.getElementById('job-content').value = job.content;
        document.getElementById('job-requirements').value = job.requirements;
        document.getElementById('job-benefits').value = job.benefits;
        document.getElementById('job-featured').checked = job.featured;
        
        const editor = document.getElementById('job-editor');
        if (editor) {
            editor.innerHTML = job.content;
        }
        
        showImagePreview(job.image, 'job');
        showAlert(`Đang chỉnh sửa: "${job.title}"`, 'success');
    }, 150);
}

// Delete job
async function deleteJob(id) {
    const job = jobsData.find(j => j.id === id);
    if (!job) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa tin tuyển dụng "${job.title}"?`)) return;
    
    jobsData = jobsData.filter(j => j.id !== id);
    await saveJobs();
    displayJobsAdmin();
    showAlert(`Đã xóa tin tuyển dụng "${job.title}" thành công!`, 'success');
}

// Reset job form
function resetJobForm() {
    editingJobId = null;
    document.getElementById('job-form-title').textContent = 'Thêm tin tuyển dụng mới';
    document.getElementById('job-form').reset();
    document.getElementById('job-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('job-editor').innerHTML = '<p>Nhập nội dung tại đây...</p>';
}

// Export jobs data
function exportJobsData() {
    const dataStr = JSON.stringify({ jobs: jobsData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recruitment-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Đã xuất dữ liệu tuyển dụng thành công!');
}

// Sync job editor content
function syncJobEditorContent() {
    const editor = document.getElementById('job-editor');
    const textarea = document.getElementById('job-content');
    
    if (editor && textarea) {
        textarea.value = editor.innerHTML;
    }
}

// Format job text in editor
function formatJobText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('job-editor').focus();
}

// Toggle HTML mode for jobs
let isJobHTMLMode = false;
function toggleJobHTMLMode() {
    const editor = document.getElementById('job-editor');
    const textarea = document.getElementById('job-content');
    
    if (isJobHTMLMode) {
        editor.innerHTML = textarea.value;
        editor.style.display = 'block';
        textarea.style.display = 'none';
        isJobHTMLMode = false;
    } else {
        textarea.value = editor.innerHTML;
        editor.style.display = 'none';
        textarea.style.display = 'block';
        isJobHTMLMode = true;
    }
}

// Handle job content image upload - Upload to server
async function handleJobContentImageUpload(event) {
    // Prevent any default behavior
    if (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    }
    
    try {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const editor = document.getElementById('job-editor');
        if (!editor) return;
        
        // Focus editor first to ensure we have a valid selection
        editor.focus();
    
    for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
            showAlert('Vui lòng chỉ chọn file ảnh!', 'error');
            continue;
        }
        
        if (file.size > 15 * 1024 * 1024) {
            showAlert('Kích thước ảnh không được vượt quá 15MB!', 'error');
            continue;
        }
        
        try {
            showAlert('Đang upload ảnh lên server...', 'success');
            const compressedData = await compressImage(file, 600, 0.6);
            
            // Upload to server
            let imageSrc = compressedData;
            if (typeof uploadImageToServer === 'function') {
                const uploadResult = await uploadImageToServer(compressedData, 'recruitment-content');
                if (uploadResult.success) {
                    imageSrc = uploadResult.path;
                }
            }
            
            // Create image element
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = 'Ảnh tin tuyển dụng';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '15px auto';
            img.style.display = 'block';
            
            // Get current selection
            const selection = window.getSelection();
            let range;
            
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                
                // Make sure we're inside the editor
                let container = range.commonAncestorContainer;
                if (container.nodeType === 3) { // Text node
                    container = container.parentNode;
                }
                
                if (editor.contains(container)) {
                    // Insert at cursor position
                    range.deleteContents();
                    
                    // Create a paragraph wrapper
                    const p = document.createElement('p');
                    p.appendChild(img);
                    
                    range.insertNode(p);
                    
                    // Move cursor after image
                    range.setStartAfter(p);
                    range.setEndAfter(p);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    // If not in editor, append to end
                    const p = document.createElement('p');
                    p.appendChild(img);
                    editor.appendChild(p);
                }
            } else {
                // No selection, append to end
                const p = document.createElement('p');
                p.appendChild(img);
                editor.appendChild(p);
            }
            
            if (imageSrc.startsWith('images/')) {
                showAlert(`Đã upload ảnh: ${imageSrc}`, 'success');
            } else {
                const sizeKB = (compressedData.length * 0.75 / 1024).toFixed(0);
                showAlert(`Đã thêm ảnh (${sizeKB}KB) vào nội dung!`, 'success');
            }
        } catch (error) {
            showAlert('Lỗi khi xử lý ảnh: ' + error.message, 'error');
        }
    }
    
    event.target.value = '';
    
    // Refocus editor
    editor.focus();
    } catch (outerError) {
        console.error('handleJobContentImageUpload error:', outerError);
        showAlert('Lỗi khi upload ảnh: ' + outerError.message, 'error');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}
