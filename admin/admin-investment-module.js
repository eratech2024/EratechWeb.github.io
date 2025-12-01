// Investment Management Module for Admin
let investmentsData = [];
let editingInvestmentId = null;

// API Base URL
const INVESTMENT_API_BASE = 'http://localhost:3000';

// Load investments
async function loadInvestmentsAdmin() {
    // Try to load from API first
    try {
        const response = await fetch(INVESTMENT_API_BASE + '/api/get-data/investment');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.investments) {
                investmentsData = result.data.investments;
                console.log('Investments loaded from API');
                displayInvestmentsAdmin();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('investments');
    if (stored) {
        investmentsData = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('../data/investment-data.json');
            const data = await response.json();
            investmentsData = data.investments;
            await saveInvestments();
        } catch (error) {
            console.error('Error loading investments:', error);
            investmentsData = [];
        }
    }
    displayInvestmentsAdmin();
}

// Save investments
async function saveInvestments() {
    try {
        const dataStr = JSON.stringify(investmentsData);
        const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
        console.log(`Investments data size: ${sizeInMB.toFixed(2)} MB`);
        
        let serverSaved = false;
        let localSaved = false;
        
        // Save to server via API
        try {
            const response = await fetch(INVESTMENT_API_BASE + '/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'investment',
                    data: { investments: investmentsData }
                })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Investments saved to server');
                serverSaved = true;
            }
        } catch (apiError) {
            console.warn('API save failed:', apiError.message);
        }
        
        // Also save to localStorage as backup
        try {
            if (sizeInMB <= 4) {
                localStorage.setItem('investments', dataStr);
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
function autoExportInvestmentsJSON() {
    const dataStr = JSON.stringify({ investments: investmentsData }, null, 2);
    console.log('Investments data ready for export');
}

// Display investments list
function displayInvestmentsAdmin() {
    const container = document.getElementById('investments-container');
    
    if (investmentsData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Chưa có dự án đầu tư nào.</p>
            </div>
        `;
        return;
    }
    
    const sortedInvestments = [...investmentsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedInvestments.map(investment => {
        const statusClass = investment.status === 'Hoàn thành' ? 'completed' : 'active';
        const statusBadge = investment.status === 'Hoàn thành'
            ? '<span class="badge" style="background: #28a745;"><i class="fas fa-check-circle"></i> Hoàn thành</span>'
            : '<span class="badge" style="background: #007bff;"><i class="fas fa-spinner"></i> Đang triển khai</span>';
        
        return `
        <div class="article-item">
            <div class="article-header">
                <div>
                    <h3 class="article-title">${investment.title}</h3>
                    ${statusBadge}
                    ${investment.featured ? '<span class="badge badge-featured"><i class="fas fa-star"></i> Nổi bật</span>' : ''}
                </div>
            </div>
            <div class="article-meta">
                <span><i class="fas fa-folder"></i> ${investment.category}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${investment.location}</span>
                <span><i class="fas fa-money-bill-wave"></i> ${investment.investmentAmount}</span>
                ${investment.progress ? `<span><i class="fas fa-tasks"></i> ${investment.progress}%</span>` : ''}
            </div>
            <p class="article-excerpt">${investment.excerpt}</p>
            <div class="article-actions">
                <button class="btn btn-edit" onclick="editInvestment(${investment.id})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-danger" onclick="deleteInvestment(${investment.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `}).join('');
}

// Handle investment form submit
async function handleInvestmentFormSubmit(e) {
    e.preventDefault();
    
    syncInvestmentEditorContent();
    
    const content = document.getElementById('investment-content').value;
    if (!content || content.trim() === '' || content.trim() === '<p>Nhập nội dung tại đây...</p>') {
        showAlert('Vui lòng nhập nội dung dự án đầu tư!', 'error');
        document.getElementById('investment-editor').focus();
        return;
    }
    
    const formData = {
        id: editingInvestmentId || Date.now(),
        title: document.getElementById('investment-title').value,
        category: document.getElementById('investment-category').value,
        location: document.getElementById('investment-location').value,
        investmentAmount: document.getElementById('investment-amount').value,
        status: document.getElementById('investment-status').value,
        progress: parseInt(document.getElementById('investment-progress').value) || 0,
        startDate: document.getElementById('investment-start-date').value,
        expectedEndDate: document.getElementById('investment-end-date').value,
        date: document.getElementById('investment-date').value,
        image: document.getElementById('investment-image').value,
        excerpt: document.getElementById('investment-excerpt').value,
        content: content,
        investor: document.getElementById('investment-investor').value,
        partner: document.getElementById('investment-partner').value,
        featured: document.getElementById('investment-featured').checked
    };
    
    if (editingInvestmentId) {
        const index = investmentsData.findIndex(i => i.id === editingInvestmentId);
        if (index !== -1) {
            investmentsData[index] = formData;
        }
    } else {
        investmentsData.push(formData);
    }
    
    const saved = await saveInvestments();
    if (!saved) return;
    
    displayInvestmentsAdmin();
    resetInvestmentForm();
    showAlert(editingInvestmentId ? 'Cập nhật dự án đầu tư thành công!' : 'Thêm dự án đầu tư mới thành công!', 'success');
    
    // Switch to investments list tab
    setTimeout(() => {
        const investmentsListTab = document.querySelector('.menu-item[data-tab="investments-list"]');
        if (investmentsListTab) {
            investmentsListTab.click();
        }
    }, 100);
}

// Edit investment
function editInvestment(id) {
    const investment = investmentsData.find(i => i.id === id);
    if (!investment) return;
    
    editingInvestmentId = id;
    document.querySelector('.menu-item[data-tab="investments-new"]').click();
    
    setTimeout(() => {
        document.getElementById('investment-form-title').textContent = 'Chỉnh sửa dự án đầu tư';
        document.getElementById('investment-title').value = investment.title;
        document.getElementById('investment-category').value = investment.category;
        document.getElementById('investment-location').value = investment.location;
        document.getElementById('investment-amount').value = investment.investmentAmount;
        document.getElementById('investment-status').value = investment.status;
        document.getElementById('investment-progress').value = investment.progress || 0;
        document.getElementById('investment-start-date').value = investment.startDate;
        document.getElementById('investment-end-date').value = investment.expectedEndDate;
        document.getElementById('investment-date').value = investment.date;
        document.getElementById('investment-image').value = investment.image;
        document.getElementById('investment-excerpt').value = investment.excerpt;
        document.getElementById('investment-content').value = investment.content;
        document.getElementById('investment-investor').value = investment.investor;
        document.getElementById('investment-partner').value = investment.partner;
        document.getElementById('investment-featured').checked = investment.featured;
        
        const editor = document.getElementById('investment-editor');
        if (editor) {
            editor.innerHTML = investment.content;
        }
        
        showImagePreview(investment.image, 'investment');
        showAlert(`Đang chỉnh sửa: "${investment.title}"`, 'success');
    }, 150);
}

// Delete investment
async function deleteInvestment(id) {
    const investment = investmentsData.find(i => i.id === id);
    if (!investment) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa dự án "${investment.title}"?`)) return;
    
    investmentsData = investmentsData.filter(i => i.id !== id);
    await saveInvestments();
    displayInvestmentsAdmin();
    showAlert(`Đã xóa dự án "${investment.title}" thành công!`, 'success');
}

// Reset investment form
function resetInvestmentForm() {
    editingInvestmentId = null;
    document.getElementById('investment-form-title').textContent = 'Thêm dự án đầu tư mới';
    document.getElementById('investment-form').reset();
    document.getElementById('investment-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('investment-editor').innerHTML = '<p>Nhập nội dung tại đây...</p>';
}

// Export investments data
function exportInvestmentsData() {
    const dataStr = JSON.stringify({ investments: investmentsData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'investment-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Đã xuất dữ liệu đầu tư thành công!');
}

// Sync investment editor content
function syncInvestmentEditorContent() {
    const editor = document.getElementById('investment-editor');
    const textarea = document.getElementById('investment-content');
    
    if (editor && textarea) {
        textarea.value = editor.innerHTML;
    }
}

// Format investment text in editor
function formatInvestmentText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('investment-editor').focus();
}

// Toggle HTML mode for investments
let isInvestmentHTMLMode = false;
function toggleInvestmentHTMLMode() {
    const editor = document.getElementById('investment-editor');
    const textarea = document.getElementById('investment-content');
    
    if (isInvestmentHTMLMode) {
        editor.innerHTML = textarea.value;
        editor.style.display = 'block';
        textarea.style.display = 'none';
        isInvestmentHTMLMode = false;
    } else {
        textarea.value = editor.innerHTML;
        editor.style.display = 'none';
        textarea.style.display = 'block';
        isInvestmentHTMLMode = true;
    }
}

// Handle investment content image upload - Upload to server
async function handleInvestmentContentImageUpload(event) {
    // Prevent any default behavior
    if (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    }
    
    try {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const editor = document.getElementById('investment-editor');
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
                const uploadResult = await uploadImageToServer(compressedData, 'investments-content');
                if (uploadResult.success) {
                    imageSrc = uploadResult.path;
                }
            }
            
            // Create image element
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = 'Ảnh dự án đầu tư';
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
        console.error('handleInvestmentContentImageUpload error:', outerError);
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
