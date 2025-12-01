// Services Management Module for Admin
let servicesData = [];
let editingServiceId = null;

// API Base URL
const SERVICES_API_BASE = 'http://localhost:3000';

// Load services
async function loadServicesAdmin() {
    // Try to load from API first
    try {
        const response = await fetch(SERVICES_API_BASE + '/api/get-data/services');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.services) {
                servicesData = result.data.services;
                console.log('Services loaded from API');
                displayServicesAdmin();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('services');
    if (stored) {
        servicesData = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('../data/services-data.json');
            const data = await response.json();
            servicesData = data.services;
            await saveServices();
        } catch (error) {
            console.error('Error loading services:', error);
            servicesData = [];
        }
    }
    displayServicesAdmin();
}

// Save services
async function saveServices() {
    try {
        const dataStr = JSON.stringify(servicesData);
        const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
        console.log(`Services data size: ${sizeInMB.toFixed(2)} MB`);
        
        let serverSaved = false;
        let localSaved = false;
        
        // Save to server via API
        try {
            const response = await fetch(SERVICES_API_BASE + '/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'services',
                    data: { services: servicesData }
                })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Services saved to server');
                serverSaved = true;
            }
        } catch (apiError) {
            console.warn('API save failed:', apiError.message);
        }
        
        // Also save to localStorage as backup
        try {
            if (sizeInMB <= 4) {
                localStorage.setItem('services', dataStr);
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
function autoExportServicesJSON() {
    const dataStr = JSON.stringify({ services: servicesData }, null, 2);
    console.log('Services data ready for export');
}

// Display services list
function displayServicesAdmin() {
    const container = document.getElementById('services-container');
    
    if (servicesData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Chưa có dịch vụ nào.</p>
            </div>
        `;
        return;
    }
    
    const sortedServices = [...servicesData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedServices.map(service => `
        <div class="article-item">
            <div class="article-header">
                <div>
                    <h3 class="article-title">${service.title}</h3>
                    ${service.featured ? '<span class="badge badge-featured"><i class="fas fa-star"></i> Nổi bật</span>' : ''}
                </div>
            </div>
            <div class="article-meta">
                <span><i class="fas fa-folder"></i> ${service.category}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(service.date)}</span>
                <span><i class="fas fa-user"></i> ${service.author}</span>
            </div>
            <p class="article-excerpt">${service.excerpt}</p>
            <div class="article-actions">
                <button class="btn btn-edit" onclick="editService(${service.id})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-danger" onclick="deleteService(${service.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `).join('');
}

// Handle service form submit
async function handleServiceFormSubmit(e) {
    e.preventDefault();
    
    syncServiceEditorContent();
    
    const content = document.getElementById('service-content').value;
    if (!content || content.trim() === '' || content.trim() === '<p>Nhập nội dung dịch vụ tại đây...</p>') {
        showAlert('Vui lòng nhập nội dung dịch vụ!', 'error');
        document.getElementById('service-editor').focus();
        return;
    }
    
    const formData = {
        id: editingServiceId || Date.now(),
        title: document.getElementById('service-title').value,
        category: document.getElementById('service-category').value,
        date: document.getElementById('service-date').value,
        author: document.getElementById('service-author').value,
        image: document.getElementById('service-image').value,
        excerpt: document.getElementById('service-excerpt').value,
        content: content,
        featured: document.getElementById('service-featured').checked
    };
    
    if (editingServiceId) {
        const index = servicesData.findIndex(s => s.id === editingServiceId);
        if (index !== -1) {
            servicesData[index] = formData;
        }
    } else {
        servicesData.push(formData);
    }
    
    const saved = await saveServices();
    if (!saved) return;
    
    displayServicesAdmin();
    resetServiceForm();
    showAlert(editingServiceId ? 'Cập nhật dịch vụ thành công!' : 'Thêm dịch vụ mới thành công!', 'success');
    document.querySelector('.menu-item[data-tab="services-list"]').click();
}

// Edit service
function editService(id) {
    const service = servicesData.find(s => s.id === id);
    if (!service) return;
    
    editingServiceId = id;
    document.querySelector('.menu-item[data-tab="services-new"]').click();
    
    setTimeout(() => {
        document.getElementById('service-form-title').textContent = 'Chỉnh sửa dịch vụ';
        document.getElementById('service-title').value = service.title;
        document.getElementById('service-category').value = service.category;
        document.getElementById('service-date').value = service.date;
        document.getElementById('service-author').value = service.author;
        document.getElementById('service-image').value = service.image;
        document.getElementById('service-excerpt').value = service.excerpt;
        document.getElementById('service-content').value = service.content;
        document.getElementById('service-featured').checked = service.featured;
        
        const editor = document.getElementById('service-editor');
        if (editor) {
            editor.innerHTML = service.content;
        }
        
        showImagePreview(service.image, 'service');
        showAlert(`Đang chỉnh sửa dịch vụ: "${service.title}"`, 'success');
    }, 150);
}

// Delete service
async function deleteService(id) {
    const service = servicesData.find(s => s.id === id);
    if (!service) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.title}"?`)) return;
    
    servicesData = servicesData.filter(s => s.id !== id);
    await saveServices();
    displayServicesAdmin();
    showAlert(`Đã xóa dịch vụ "${service.title}" thành công!`, 'success');
}

// Reset service form
function resetServiceForm() {
    editingServiceId = null;
    document.getElementById('service-form-title').textContent = 'Thêm dịch vụ mới';
    document.getElementById('service-form').reset();
    document.getElementById('service-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('service-editor').innerHTML = '<p>Nhập nội dung dịch vụ tại đây...</p>';
}

// Export services data
function exportServicesData() {
    const dataStr = JSON.stringify({ services: servicesData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'services-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Đã xuất dữ liệu dịch vụ thành công!');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}
