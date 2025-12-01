// Admin JavaScript for managing news articles

let articles = [];
let editingId = null;

// Load articles from server API or localStorage
async function loadArticles() {
    try {
        // Try to load from server API first
        const response = await fetch('http://localhost:3000/api/get-data/news');
        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.articles) {
                articles = result.data.articles;
                console.log('Articles loaded from server');
                displayArticles();
                return;
            }
        }
    } catch (apiError) {
        console.warn('API load failed, trying localStorage:', apiError.message);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('newsArticles');
    if (stored) {
        articles = JSON.parse(stored);
        console.log('Articles loaded from localStorage');
    } else {
        // Load from JSON file on first load
        try {
            const response = await fetch('../data/news-data.json');
            const data = await response.json();
            articles = data.articles;
            await saveArticles();
        } catch (error) {
            console.error('Error loading articles:', error);
            articles = [];
        }
    }
    displayArticles();
}

// Save articles to localStorage
async function saveArticles() {
    try {
        const dataStr = JSON.stringify(articles);
        
        // Check data size
        const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
        console.log(`Data size: ${sizeInMB.toFixed(2)} MB`);
        
        let serverSaved = false;
        let localSaved = false;
        
        // Save to server via API first
        try {
            const response = await fetch('http://localhost:3000/api/save-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'news',
                    data: { articles: articles }
                })
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('Articles saved to server');
                serverSaved = true;
            } else {
                console.warn('Server save failed:', result.message);
            }
        } catch (apiError) {
            console.warn('API save failed, using localStorage only:', apiError.message);
        }
        
        // Also save to localStorage as backup (with size limit)
        try {
            if (sizeInMB <= 4) {
                localStorage.setItem('newsArticles', dataStr);
                console.log('Articles saved to localStorage');
                localSaved = true;
            } else {
                console.warn('Data too large for localStorage, saved to server only');
            }
        } catch (localError) {
            console.warn('localStorage save failed:', localError.message);
        }
        
        // Show appropriate message
        if (serverSaved) {
            showAlert('Đã lưu dữ liệu thành công!', 'success');
        } else if (localSaved) {
            showAlert('Đã lưu vào localStorage (Server không khả dụng)', 'success');
        } else {
            showAlert('Lỗi: Không thể lưu dữ liệu!', 'error');
            return false;
        }
        
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showAlert('Lỗi: LocalStorage đã đầy!', 'error');
            console.error('LocalStorage quota exceeded');
        } else {
            showAlert('Lỗi khi lưu dữ liệu: ' + e.message, 'error');
            console.error('Save error:', e);
        }
        return false;
    }
}

// Auto export articles to JSON file
function autoExportToJSON() {
    const dataStr = JSON.stringify({ articles: articles }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'news-data.json';
    
    // Auto download (commented out to avoid annoying users)
    // Uncomment the line below if you want auto download
    // link.click();
    
    URL.revokeObjectURL(url);
    
    console.log('JSON data ready for export');
}

// Display all articles
function displayArticles() {
    const container = document.getElementById('articles-container');
    
    // Update articles count in header
    const listHeader = document.querySelector('#tab-list h2');
    if (listHeader) {
        listHeader.innerHTML = `
            Danh sách bài viết
            <span class="articles-count">${articles.length} bài viết</span>
        `;
    }
    
    if (articles.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <p style="color: #999; font-size: 1.1rem;">Chưa có bài viết nào.</p>
                <button class="btn btn-primary" onclick="document.querySelector('.menu-item[data-tab=\\'new\\']').click()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Thêm bài viết đầu tiên
                </button>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedArticles = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedArticles.map(article => `
        <div class="article-item ${article.featured ? 'featured' : ''}">
            <div class="article-header">
                <div>
                    <h3 class="article-title">${article.title}</h3>
                    ${article.featured ? '<span class="badge badge-featured"><i class="fas fa-star"></i> Nổi bật</span>' : ''}
                </div>
            </div>
            <div class="article-meta">
                <span><i class="fas fa-folder"></i> ${article.category}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
                <span><i class="fas fa-user"></i> ${article.author}</span>
            </div>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-actions">
                <button class="btn btn-edit" onclick="editArticle(${article.id})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-danger" onclick="deleteArticle(${article.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `).join('');
}

// Format date to Vietnamese format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Show alert message
function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    container.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted!');
    
    // Sync editor content to textarea
    syncEditorContent();
    console.log('Editor synced');
    
    // Validate content
    const content = document.getElementById('content').value;
    if (!content || content.trim() === '' || content.trim() === '<p>Nhập nội dung bài viết tại đây...</p>') {
        showAlert('Vui lòng nhập nội dung bài viết!', 'error');
        document.getElementById('editor').focus();
        return;
    }
    
    const formData = {
        id: editingId || Date.now(),
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        author: document.getElementById('author').value,
        image: document.getElementById('image').value,
        excerpt: document.getElementById('excerpt').value,
        content: document.getElementById('content').value,
        featured: document.getElementById('featured').checked
    };
    
    if (editingId) {
        // Update existing article
        const index = articles.findIndex(a => a.id === editingId);
        if (index !== -1) {
            articles[index] = formData;
        }
    } else {
        // Add new article
        articles.push(formData);
    }
    
    // Try to save
    const saved = await saveArticles();
    
    if (!saved) {
        // Rollback if save failed
        if (editingId) {
            await loadArticles(); // Reload from localStorage
        } else {
            articles.pop(); // Remove the newly added article
        }
        return;
    }
    
    displayArticles();
    resetForm();
    
    // Show success message
    if (editingId) {
        showAlert('Cập nhật bài viết thành công! Nhớ nhấn "Xuất dữ liệu" để backup.', 'success');
    } else {
        showAlert('Thêm bài viết mới thành công! Nhớ nhấn "Xuất dữ liệu" để backup.', 'success');
    }
    
    // Switch back to list tab
    document.querySelector('.menu-item[data-tab="list"]').click();
}

// Edit article
function editArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) {
        console.error('Article not found:', id);
        return;
    }
    
    console.log('Editing article:', article);
    
    editingId = id;
    
    // Switch to new tab first
    document.querySelector('.menu-item[data-tab="new"]').click();
    
    // Wait for tab to switch, then load all data
    setTimeout(() => {
        // Update form title
        const formTitle = document.getElementById('form-title');
        if (formTitle) {
            formTitle.textContent = 'Chỉnh sửa bài viết';
        }
        
        // Fill all form fields
        const fields = {
            'article-id': id,
            'title': article.title,
            'category': article.category,
            'date': article.date,
            'author': article.author,
            'image': article.image,
            'excerpt': article.excerpt,
            'content': article.content
        };
        
        // Set each field value
        for (const [fieldId, value] of Object.entries(fields)) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value || '';
                console.log(`Set ${fieldId}:`, value);
            } else {
                console.warn(`Field not found: ${fieldId}`);
            }
        }
        
        // Set featured checkbox
        const featuredCheckbox = document.getElementById('featured');
        if (featuredCheckbox) {
            featuredCheckbox.checked = article.featured || false;
            console.log('Set featured:', article.featured);
        }
        
        // Load content into editor
        const editor = document.getElementById('editor');
        if (editor) {
            editor.innerHTML = article.content || '<p>Nhập nội dung bài viết...</p>';
            console.log('Editor content loaded');
        } else {
            console.warn('Editor not found');
        }
        
        // Show image preview
        if (article.image) {
            showImagePreview(article.image);
            console.log('Image preview shown');
        }
        
        // Show info message
        showAlert(`Đang chỉnh sửa bài viết: "${article.title}"`, 'success');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
}

// Delete article
async function deleteArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${article.title}"?\n\nHành động này không thể hoàn tác!`)) return;
    
    articles = articles.filter(a => a.id !== id);
    await saveArticles();
    displayArticles();
    
    // Show success message
    showAlert(`Đã xóa bài viết "${article.title}" thành công!`, 'success');
    
    // Scroll to top to see the message
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset form
function resetForm() {
    editingId = null;
    document.getElementById('form-title').textContent = 'Thêm bài viết mới';
    document.getElementById('article-form').reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Clear editor
    document.getElementById('editor').innerHTML = '<p>Nhập nội dung bài viết tại đây...</p>';
    
    // Hide image preview
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageUpload').value = '';
    
    // Reset HTML mode
    if (isHTMLMode) {
        toggleHTMLMode();
    }
}

// Export data as JSON
function exportData() {
    const dataStr = JSON.stringify({ articles: articles }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'news-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Đã xuất dữ liệu thành công!');
}

// Load data from JSON file
async function loadFromJSON() {
    if (!confirm('Bạn có chắc muốn load dữ liệu từ news-data.json? Dữ liệu hiện tại sẽ bị ghi đè!')) {
        return;
    }
    
    try {
        const response = await fetch('../data/news-data.json');
        const data = await response.json();
        articles = data.articles;
        await saveArticles();
        displayArticles();
        showAlert(`Đã load thành công ${articles.length} bài viết từ news-data.json!`);
    } catch (error) {
        showAlert('Lỗi khi load dữ liệu: ' + error.message, 'error');
    }
}

// Format text in editor
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor').focus();
}

// ============================================
// BLOCK EDITOR (Elementor-like)
// ============================================

let selectedBlock = null;
let draggedWidget = null;
let currentImageBlock = null;

// Initialize Block Editor
function initBlockEditor() {
    const canvas = document.getElementById('editor');
    if (!canvas || !canvas.classList.contains('block-canvas')) return;
    
    // Initialize widget drag
    document.querySelectorAll('.widget-item').forEach(widget => {
        widget.addEventListener('dragstart', handleWidgetDragStart);
        widget.addEventListener('dragend', handleWidgetDragEnd);
    });
    
    // Canvas drop events
    canvas.addEventListener('dragover', handleCanvasDragOver);
    canvas.addEventListener('dragleave', handleCanvasDragLeave);
    canvas.addEventListener('drop', handleCanvasDrop);
    
    // Click to deselect
    canvas.addEventListener('click', function(e) {
        if (e.target === canvas) {
            deselectAllBlocks();
        }
    });
    
    // Paste image support
    canvas.addEventListener('paste', handlePasteImage);
    
    console.log('Block Editor initialized');
}

// Widget Drag Start
function handleWidgetDragStart(e) {
    draggedWidget = e.target.closest('.widget-item');
    draggedWidget.classList.add('dragging');
    e.dataTransfer.setData('widget-type', draggedWidget.dataset.type);
    e.dataTransfer.effectAllowed = 'copy';
}

// Widget Drag End
function handleWidgetDragEnd(e) {
    if (draggedWidget) {
        draggedWidget.classList.remove('dragging');
        draggedWidget = null;
    }
    removeDropIndicators();
}

// Canvas Drag Over
function handleCanvasDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    const canvas = document.getElementById('editor');
    canvas.classList.add('drag-over');
    
    // Show drop indicator
    const afterElement = getDragAfterElement(canvas, e.clientY);
    const indicator = document.querySelector('.drop-indicator') || createDropIndicator();
    
    if (afterElement) {
        canvas.insertBefore(indicator, afterElement);
    } else {
        canvas.appendChild(indicator);
    }
}

// Canvas Drag Leave
function handleCanvasDragLeave(e) {
    const canvas = document.getElementById('editor');
    if (!canvas.contains(e.relatedTarget)) {
        canvas.classList.remove('drag-over');
        removeDropIndicators();
    }
}

// Canvas Drop
async function handleCanvasDrop(e) {
    e.preventDefault();
    const canvas = document.getElementById('editor');
    canvas.classList.remove('drag-over');
    removeDropIndicators();
    
    // Check if dropping files (images)
    if (e.dataTransfer.files.length > 0) {
        await handleDroppedFiles(e.dataTransfer.files, e);
        return;
    }
    
    // Check if dropping widget
    const widgetType = e.dataTransfer.getData('widget-type');
    if (widgetType) {
        const block = createBlock(widgetType);
        const afterElement = getDragAfterElement(canvas, e.clientY);
        
        if (afterElement) {
            canvas.insertBefore(block, afterElement);
        } else {
            canvas.appendChild(block);
        }
        
        selectBlock(block);
        showAlert(`Đã thêm block "${widgetType}"`, 'success');
    }
    
    // Check if reordering blocks
    if (window.draggedBlock) {
        const afterElement = getDragAfterElement(canvas, e.clientY);
        if (afterElement) {
            canvas.insertBefore(window.draggedBlock, afterElement);
        } else {
            canvas.appendChild(window.draggedBlock);
        }
        window.draggedBlock = null;
    }
}

// Create Block based on type
function createBlock(type) {
    const block = document.createElement('div');
    block.className = 'content-block';
    block.draggable = true;
    block.dataset.type = type;
    
    // Block controls
    const controls = `
        <div class="block-controls">
            <button type="button" class="block-ctrl-btn" onclick="moveBlockUp(this)" title="Di chuyển lên">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button type="button" class="block-ctrl-btn" onclick="moveBlockDown(this)" title="Di chuyển xuống">
                <i class="fas fa-arrow-down"></i>
            </button>
            <button type="button" class="block-ctrl-btn" onclick="duplicateBlock(this)" title="Nhân đôi">
                <i class="fas fa-copy"></i>
            </button>
            <button type="button" class="block-ctrl-btn delete" onclick="deleteBlock(this)" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <span class="block-type-label">${getBlockLabel(type)}</span>
    `;
    
    // Block content based on type
    let content = '';
    switch(type) {
        case 'heading':
            content = `<div class="block-content" contenteditable="true"><h3>Nhập tiêu đề...</h3></div>`;
            break;
        case 'text':
            content = `<div class="block-content" contenteditable="true"><p>Nhập nội dung văn bản...</p></div>`;
            break;
        case 'image':
            content = `
                <div class="block-content">
                    <div class="image-upload-area" onclick="triggerImageUpload(this)">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click hoặc kéo thả ảnh vào đây</p>
                    </div>
                </div>`;
            break;
        case 'gallery':
            content = `
                <div class="block-content">
                    <div class="gallery-grid">
                        <div class="add-gallery-btn" onclick="triggerGalleryUpload(this)">
                            <i class="fas fa-plus"></i>
                            <span>Thêm ảnh</span>
                        </div>
                    </div>
                </div>`;
            break;
        case 'list':
            content = `<div class="block-content" contenteditable="true"><ul><li>Mục 1</li><li>Mục 2</li><li>Mục 3</li></ul></div>`;
            break;
        case 'quote':
            content = `<div class="block-content" contenteditable="true"><blockquote>Nhập trích dẫn...</blockquote></div>`;
            break;
        case 'divider':
            content = `<div class="block-content"><hr></div>`;
            break;
        case 'spacer':
            content = `<div class="block-content"><div class="spacer-block"></div></div>`;
            break;
        case 'columns':
            content = `
                <div class="block-content">
                    <div class="columns-block">
                        <div class="column" data-column="1">
                            <div class="column-drop-zone" onclick="addContentToColumn(this, 1)">
                                <i class="fas fa-plus-circle"></i>
                                <span>Thêm nội dung</span>
                                <div class="column-actions">
                                    <button type="button" class="col-btn" onclick="event.stopPropagation(); addTextToColumn(this, 1)" title="Thêm văn bản">
                                        <i class="fas fa-paragraph"></i>
                                    </button>
                                    <button type="button" class="col-btn" onclick="event.stopPropagation(); event.preventDefault(); addImageToColumn(this, 1, event); return false;" title="Thêm ảnh">
                                        <i class="fas fa-image"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="column" data-column="2">
                            <div class="column-drop-zone" onclick="addContentToColumn(this, 2)">
                                <i class="fas fa-plus-circle"></i>
                                <span>Thêm nội dung</span>
                                <div class="column-actions">
                                    <button type="button" class="col-btn" onclick="event.stopPropagation(); addTextToColumn(this, 2)" title="Thêm văn bản">
                                        <i class="fas fa-paragraph"></i>
                                    </button>
                                    <button type="button" class="col-btn" onclick="event.stopPropagation(); event.preventDefault(); addImageToColumn(this, 2, event); return false;" title="Thêm ảnh">
                                        <i class="fas fa-image"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        default:
            content = `<div class="block-content" contenteditable="true"></div>`;
    }
    
    block.innerHTML = controls + content;
    
    // Add drag events for reordering
    block.addEventListener('dragstart', handleBlockDragStart);
    block.addEventListener('dragend', handleBlockDragEnd);
    block.addEventListener('click', function(e) {
        e.stopPropagation();
        selectBlock(block);
    });
    
    return block;
}

// Get block label
function getBlockLabel(type) {
    const labels = {
        'heading': 'Tiêu đề',
        'text': 'Văn bản',
        'image': 'Hình ảnh',
        'gallery': 'Thư viện',
        'list': 'Danh sách',
        'quote': 'Trích dẫn',
        'divider': 'Đường kẻ',
        'spacer': 'Khoảng cách',
        'columns': '2 Cột'
    };
    return labels[type] || type;
}

// Block Drag Start
function handleBlockDragStart(e) {
    window.draggedBlock = e.target.closest('.content-block');
    window.draggedBlock.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

// Block Drag End
function handleBlockDragEnd(e) {
    if (window.draggedBlock) {
        window.draggedBlock.classList.remove('dragging');
        window.draggedBlock = null;
    }
    removeDropIndicators();
}

// Get element after drag position
function getDragAfterElement(container, y) {
    const blocks = [...container.querySelectorAll('.content-block:not(.dragging)')];
    
    return blocks.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Create drop indicator
function createDropIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    return indicator;
}

// Remove drop indicators
function removeDropIndicators() {
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
}

// Select block
function selectBlock(block) {
    deselectAllBlocks();
    block.classList.add('selected');
    selectedBlock = block;
}

// Deselect all blocks
function deselectAllBlocks() {
    document.querySelectorAll('.content-block.selected').forEach(el => {
        el.classList.remove('selected');
    });
    selectedBlock = null;
}

// Move block up
function moveBlockUp(btn) {
    const block = btn.closest('.content-block');
    const prev = block.previousElementSibling;
    if (prev && prev.classList.contains('content-block')) {
        block.parentNode.insertBefore(block, prev);
    }
}

// Move block down
function moveBlockDown(btn) {
    const block = btn.closest('.content-block');
    const next = block.nextElementSibling;
    if (next && next.classList.contains('content-block')) {
        block.parentNode.insertBefore(next, block);
    }
}

// Duplicate block
function duplicateBlock(btn) {
    const block = btn.closest('.content-block');
    const clone = block.cloneNode(true);
    
    // Re-attach event listeners
    clone.addEventListener('dragstart', handleBlockDragStart);
    clone.addEventListener('dragend', handleBlockDragEnd);
    clone.addEventListener('click', function(e) {
        e.stopPropagation();
        selectBlock(clone);
    });
    
    block.parentNode.insertBefore(clone, block.nextSibling);
    selectBlock(clone);
    showAlert('Đã nhân đôi block!', 'success');
}

// Delete block
function deleteBlock(btn) {
    if (confirm('Bạn có chắc muốn xóa block này?')) {
        const block = btn.closest('.content-block');
        block.remove();
        showAlert('Đã xóa block!', 'success');
    }
}

// Clear all blocks
function clearAllBlocks() {
    if (confirm('Bạn có chắc muốn xóa tất cả nội dung?')) {
        const canvas = document.getElementById('editor');
        canvas.innerHTML = '';
        showAlert('Đã xóa tất cả!', 'success');
    }
}

// Tạo input file động để tránh vấn đề form submit
function openDynamicFileInput(multiple = false) {
    // Xóa input cũ nếu có
    const oldInput = document.getElementById('dynamic-file-input');
    if (oldInput) oldInput.remove();
    
    // Tạo input mới
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'dynamic-file-input';
    input.accept = 'image/*';
    input.multiple = multiple;
    input.style.display = 'none';
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    
    // Thêm vào body (ngoài form) - QUAN TRỌNG: phải ngoài form
    document.body.appendChild(input);
    
    // Xử lý khi chọn file
    input.onchange = function(e) {
        // Ngăn chặn mọi hành vi mặc định
        e.preventDefault();
        e.stopPropagation();
        
        handleBlockImageUpload(e);
        // Xóa input sau khi xử lý
        setTimeout(function() { 
            if (input && input.parentNode) {
                input.remove(); 
            }
        }, 200);
    };
    
    // Ngăn chặn sự kiện click bubble lên form
    input.onclick = function(e) {
        e.stopPropagation();
    };
    
    // Mở dialog với delay nhỏ để đảm bảo input đã được thêm vào DOM
    setTimeout(function() {
        input.click();
    }, 10);
}

// Trigger image upload for block
function triggerImageUpload(uploadArea) {
    currentImageBlock = uploadArea.closest('.content-block');
    openDynamicFileInput(false);
}

// Trigger gallery upload
function triggerGalleryUpload(btn) {
    currentImageBlock = btn.closest('.content-block');
    openDynamicFileInput(true);
}

// Handle block image upload
async function handleBlockImageUpload(event) {
    // Prevent form submission - QUAN TRỌNG
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation && event.stopImmediatePropagation();
    }
    
    const files = event.target ? event.target.files : null;
    if (!files || files.length === 0) {
        console.log('No files selected');
        return;
    }
    
    console.log('Processing', files.length, 'file(s)');
    
    for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        
        try {
            showAlert('Đang xử lý ảnh...', 'success');
            const compressedData = await compressImage(file, 800, 0.7);
            
            let imageSrc = compressedData;
            if (typeof uploadImageToServer === 'function') {
                const result = await uploadImageToServer(compressedData, 'news-content');
                if (result.success) imageSrc = result.path;
            }
            
            // Check if uploading to column
            if (currentColumn) {
                insertImageToColumn(imageSrc);
                showAlert('Đã thêm ảnh vào cột!', 'success');
            } else if (currentImageBlock) {
                const blockType = currentImageBlock.dataset.type;
                
                if (blockType === 'gallery') {
                    // Add to gallery
                    const gallery = currentImageBlock.querySelector('.gallery-grid');
                    const img = document.createElement('img');
                    img.src = imageSrc;
                    img.alt = 'Gallery image';
                    img.onclick = function() { removeGalleryImage(this); };
                    gallery.insertBefore(img, gallery.querySelector('.add-gallery-btn'));
                } else {
                    // Replace upload area with image
                    const content = currentImageBlock.querySelector('.block-content');
                    content.innerHTML = `<img src="${imageSrc}" alt="Ảnh bài viết" style="max-width:100%; border-radius:8px;">`;
                }
                showAlert('Đã thêm ảnh!', 'success');
            }
        } catch (error) {
            showAlert('Lỗi: ' + error.message, 'error');
        }
    }
    
    event.target.value = '';
    currentImageBlock = null;
}

// Remove gallery image
function removeGalleryImage(img) {
    if (confirm('Xóa ảnh này?')) {
        img.remove();
    }
}

// ============================================
// COLUMN FUNCTIONS
// ============================================

let currentColumn = null;

// Add content to column (show options)
function addContentToColumn(dropZone, columnNum) {
    // Just show the actions, they're already visible on hover
}

// Add text to column
function addTextToColumn(btn, columnNum) {
    const column = btn.closest('.column');
    const dropZone = column.querySelector('.column-drop-zone');
    
    // Create text content
    const textDiv = document.createElement('div');
    textDiv.className = 'column-content';
    textDiv.innerHTML = `
        <div class="column-item">
            <div class="column-item-controls">
                <button type="button" onclick="deleteColumnItem(this)" title="Xóa"><i class="fas fa-times"></i></button>
            </div>
            <div contenteditable="true" class="column-text">Nhập văn bản...</div>
        </div>
    `;
    
    // Insert before drop zone or replace if first item
    if (dropZone) {
        column.insertBefore(textDiv, dropZone);
    } else {
        column.appendChild(textDiv);
    }
}

// Add image to column
function addImageToColumn(btn, columnNum, event) {
    // Ngăn chặn mọi hành vi mặc định và bubble
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
    
    currentColumn = btn.closest('.column');
    
    // Delay để tránh xung đột với form
    setTimeout(function() {
        openDynamicFileInput(false);
    }, 50);
    
    return false;
}

// Handle column image upload (called from handleBlockImageUpload)
function insertImageToColumn(imageSrc) {
    if (!currentColumn) return false;
    
    const dropZone = currentColumn.querySelector('.column-drop-zone');
    
    // Create image content
    const imgDiv = document.createElement('div');
    imgDiv.className = 'column-content';
    imgDiv.innerHTML = `
        <div class="column-item">
            <div class="column-item-controls">
                <button type="button" onclick="deleteColumnItem(this)" title="Xóa"><i class="fas fa-times"></i></button>
            </div>
            <img src="${imageSrc}" alt="Column image" style="max-width:100%; border-radius:6px;">
        </div>
    `;
    
    // Insert before drop zone
    if (dropZone) {
        currentColumn.insertBefore(imgDiv, dropZone);
    } else {
        currentColumn.appendChild(imgDiv);
    }
    
    currentColumn = null;
    return true;
}

// Delete column item
function deleteColumnItem(btn) {
    const item = btn.closest('.column-content');
    if (item) {
        item.remove();
    }
}

// Handle dropped files
async function handleDroppedFiles(files, e) {
    for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        
        try {
            const compressedData = await compressImage(file, 800, 0.7);
            let imageSrc = compressedData;
            
            if (typeof uploadImageToServer === 'function') {
                const result = await uploadImageToServer(compressedData, 'news-content');
                if (result.success) imageSrc = result.path;
            }
            
            // Create image block
            const block = createBlock('image');
            const content = block.querySelector('.block-content');
            content.innerHTML = `<img src="${imageSrc}" alt="Ảnh bài viết" style="max-width:100%; border-radius:8px;">`;
            
            const canvas = document.getElementById('editor');
            const afterElement = getDragAfterElement(canvas, e.clientY);
            
            if (afterElement) {
                canvas.insertBefore(block, afterElement);
            } else {
                canvas.appendChild(block);
            }
            
            showAlert('Đã thêm ảnh!', 'success');
        } catch (error) {
            showAlert('Lỗi: ' + error.message, 'error');
        }
    }
}

// Handle paste image
async function handlePasteImage(e) {
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            await handleDroppedFiles([file], e);
            break;
        }
    }
}

// Preview content
function previewContent() {
    const html = getEditorHTML();
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Xem trước nội dung</title>
            <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Be Vietnam Pro', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; }
                h3 { color: #195927; }
                img { max-width: 100%; border-radius: 8px; margin: 15px 0; }
                blockquote { border-left: 4px solid #195927; padding-left: 20px; margin: 20px 0; font-style: italic; color: #555; }
                hr { border: none; border-top: 2px solid #e0e0e0; margin: 30px 0; }
            </style>
        </head>
        <body>${html}</body>
        </html>
    `);
}

// Get editor HTML content
function getEditorHTML() {
    const canvas = document.getElementById('editor');
    let html = '';
    
    canvas.querySelectorAll('.content-block').forEach(block => {
        const content = block.querySelector('.block-content');
        if (content) {
            // Clean up editable attributes
            const clone = content.cloneNode(true);
            clone.querySelectorAll('[contenteditable]').forEach(el => {
                el.removeAttribute('contenteditable');
            });
            // Remove upload areas
            clone.querySelectorAll('.image-upload-area, .add-gallery-btn').forEach(el => el.remove());
            html += clone.innerHTML;
        }
    });
    
    return html;
}

// Toggle HTML mode
let isHTMLMode = false;
function toggleHTMLMode() {
    const editor = document.getElementById('editor');
    const textarea = document.getElementById('content');
    const container = document.querySelector('.block-editor-container');
    
    if (isHTMLMode) {
        // Switch back to visual mode
        if (container) {
            container.style.display = 'flex';
            // Parse HTML back to blocks would be complex, just show warning
            showAlert('Chế độ xem HTML chỉ để xem, không thể chỉnh sửa trực tiếp', 'success');
        } else {
            editor.innerHTML = textarea.value;
            editor.style.display = 'block';
        }
        textarea.style.display = 'none';
        isHTMLMode = false;
    } else {
        // Switch to HTML mode
        if (editor.classList.contains('block-canvas')) {
            textarea.value = getEditorHTML();
        } else {
            textarea.value = editor.innerHTML;
        }
        if (container) {
            container.style.display = 'none';
        } else {
            editor.style.display = 'none';
        }
        textarea.style.display = 'block';
        textarea.style.minHeight = '400px';
        textarea.style.fontFamily = 'monospace';
        textarea.style.fontSize = '13px';
        isHTMLMode = true;
    }
}

// Handle content image upload (for inserting into article body) - Upload to server
async function handleContentImageUpload(event) {
    // Prevent any default behavior
    if (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    }
    
    try {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const editor = document.getElementById('editor');
    
    for (const file of Array.from(files)) {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            showAlert('Vui lòng chỉ chọn file ảnh!', 'error');
            continue;
        }
        
        // Check file size (max 15MB)
        if (file.size > 15 * 1024 * 1024) {
            showAlert('Kích thước ảnh không được vượt quá 15MB!', 'error');
            continue;
        }
        
        try {
            showAlert('Đang upload ảnh lên server...', 'success');
            
            // Compress image
            const compressedData = await compressImage(file, 600, 0.6);
            
            // Upload to server
            let imageSrc = compressedData;
            if (typeof uploadImageToServer === 'function') {
                const uploadResult = await uploadImageToServer(compressedData, 'news-content');
                if (uploadResult.success) {
                    imageSrc = uploadResult.path;
                }
            }
            
            // Create draggable image wrapper
            const wrapper = createDraggableImage(imageSrc);
            
            // Insert at cursor or end of content
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
                const range = selection.getRangeAt(0);
                range.insertNode(wrapper);
                range.collapse(false);
            } else {
                editor.appendChild(wrapper);
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
    
    // Reset file input
    event.target.value = '';
    } catch (outerError) {
        console.error('handleContentImageUpload error:', outerError);
        showAlert('Lỗi khi upload ảnh: ' + outerError.message, 'error');
    }
}

// Sync editor content to textarea before submit
function syncEditorContent() {
    const editor = document.getElementById('editor');
    const textarea = document.getElementById('content');
    
    if (!isHTMLMode) {
        // Check if block editor
        if (editor.classList.contains('block-canvas')) {
            textarea.value = getEditorHTML();
        } else {
            textarea.value = editor.innerHTML;
        }
    }
}

// Compress image before saving
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize if too large
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed base64
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Note: handleImageUpload function is defined below with prefix parameter support

// Show image preview when editing
function showImagePreview(imagePath) {
    if (!imagePath) return;
    
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (imagePath.startsWith('data:image')) {
        // Data URL
        previewImg.src = imagePath;
        previewDiv.style.display = 'block';
    } else if (imagePath.startsWith('images/')) {
        // Relative path
        previewImg.src = imagePath;
        previewDiv.style.display = 'block';
    }
}

// Initialize
// Wait for everything to load
window.addEventListener('load', function() {
    console.log('Window loaded');
    
    // Set today's date as default
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        console.log('Date set');
    }
    
    // Initialize editor
    const editor = document.getElementById('editor');
    if (editor) {
        // Check if it's block editor or classic editor
        if (editor.classList.contains('block-canvas')) {
            initBlockEditor();
            console.log('Block Editor initialized');
        } else {
            if (!editor.innerHTML.trim()) {
                editor.innerHTML = '<p>Nhập nội dung bài viết tại đây...</p>';
            }
            console.log('Classic Editor initialized');
        }
    }
    
    // Register form submit handler
    const form = document.getElementById('article-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form submit handler registered');
    } else {
        console.error('Form not found!');
    }
    
    // Register cancel button handler
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log('Cancel clicked');
            resetForm();
            document.querySelector('.menu-item[data-tab="list"]').click();
        });
        console.log('Cancel button handler registered');
    }
    
    loadArticles();
    console.log('Articles loaded');
});

// ============================================
// SERVICES MANAGEMENT FUNCTIONS
// ============================================

// Format text in service editor
function formatServiceText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('service-editor').focus();
}

// Toggle HTML mode for services
let isServiceHTMLMode = false;
function toggleServiceHTMLMode() {
    const editor = document.getElementById('service-editor');
    const textarea = document.getElementById('service-content');
    
    if (isServiceHTMLMode) {
        // Switch back to visual mode
        editor.innerHTML = textarea.value;
        editor.style.display = 'block';
        textarea.style.display = 'none';
        isServiceHTMLMode = false;
    } else {
        // Switch to HTML mode
        textarea.value = editor.innerHTML;
        editor.style.display = 'none';
        textarea.style.display = 'block';
        isServiceHTMLMode = true;
    }
}

// Handle service content image upload - Upload to server
async function handleServiceContentImageUpload(event) {
    // Prevent any default behavior
    if (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    }
    
    try {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const editor = document.getElementById('service-editor');
    
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
                const uploadResult = await uploadImageToServer(compressedData, 'services-content');
                if (uploadResult.success) {
                    imageSrc = uploadResult.path;
                }
            }
            
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = 'Ảnh dịch vụ';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '15px auto';
            img.style.display = 'block';
            
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.insertNode(img);
                range.collapse(false);
            } else {
                editor.appendChild(img);
            }
            
            const br = document.createElement('br');
            img.parentNode.insertBefore(br, img.nextSibling);
            
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
    } catch (outerError) {
        console.error('handleServiceContentImageUpload error:', outerError);
        showAlert('Lỗi khi upload ảnh: ' + outerError.message, 'error');
    }
}

// Sync service editor content
function syncServiceEditorContent() {
    const editor = document.getElementById('service-editor');
    const textarea = document.getElementById('service-content');
    
    if (!isServiceHTMLMode) {
        textarea.value = editor.innerHTML;
    }
}

// Handle image upload with prefix parameter - Upload to server
async function handleImageUpload(event, prefix = '') {
    // Prevent any default behavior
    if (event) {
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    }
    
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showAlert('Vui lòng chọn file ảnh!', 'error');
            return;
        }
        
        if (file.size > 15 * 1024 * 1024) {
            showAlert('Kích thước ảnh không được vượt quá 15MB!', 'error');
            return;
        }
        
        showAlert('Đang xử lý và upload ảnh lên server...', 'success');
        const compressedData = await compressImage(file, 800, 0.7);
        
        const previewDiv = document.getElementById(prefix ? `${prefix}ImagePreview` : 'imagePreview');
        const previewImg = document.getElementById(prefix ? `${prefix}PreviewImg` : 'previewImg');
        const imageInput = document.getElementById(prefix ? `${prefix}-image` : 'image');
        
        if (previewImg && previewDiv && imageInput) {
            // Determine folder based on prefix
            const folderMap = {
                'service': 'services',
                'project': 'projects',
                'investment': 'investments',
                'job': 'recruitment',
                '': 'news'
            };
            const folder = folderMap[prefix] || prefix || 'general';
            
            // Upload to server
            if (typeof uploadImageToServer === 'function') {
                const uploadResult = await uploadImageToServer(compressedData, folder);
                
                if (uploadResult.success) {
                    previewImg.src = uploadResult.path;
                    previewDiv.style.display = 'block';
                    imageInput.value = uploadResult.path;
                    showAlert(`Đã upload ảnh lên server: ${uploadResult.path}`, 'success');
                } else {
                    previewImg.src = compressedData;
                    previewDiv.style.display = 'block';
                    imageInput.value = compressedData;
                    showAlert('Upload server thất bại, đã lưu dạng base64', 'error');
                }
            } else {
                previewImg.src = compressedData;
                previewDiv.style.display = 'block';
                imageInput.value = compressedData;
                const sizeKB = (compressedData.length * 0.75 / 1024).toFixed(0);
                showAlert(`Đã tải ảnh (${sizeKB}KB)`, 'success');
            }
        }
    } catch (error) {
        showAlert('Lỗi khi xử lý ảnh: ' + error.message, 'error');
    }
}

// Show image preview with prefix
function showImagePreview(imagePath, prefix = '') {
    if (!imagePath) return;
    
    const previewDiv = document.getElementById(prefix ? `${prefix}ImagePreview` : 'imagePreview');
    const previewImg = document.getElementById(prefix ? `${prefix}PreviewImg` : 'previewImg');
    
    if (previewDiv && previewImg) {
        if (imagePath.startsWith('data:image') || imagePath.startsWith('images/')) {
            previewImg.src = imagePath;
            previewDiv.style.display = 'block';
        }
    }
}

// Initialize services when window loads
window.addEventListener('load', function() {
    // Set today's date for service form
    const serviceDateInput = document.getElementById('service-date');
    if (serviceDateInput) {
        serviceDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Initialize service editor
    const serviceEditor = document.getElementById('service-editor');
    if (serviceEditor && !serviceEditor.innerHTML.trim()) {
        serviceEditor.innerHTML = '<p>Nhập nội dung dịch vụ tại đây...</p>';
    }
    
    // Register service form submit handler
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceFormSubmit);
    }
    
    // Register service cancel button
    const serviceCancelBtn = document.getElementById('service-cancel-btn');
    if (serviceCancelBtn) {
        serviceCancelBtn.addEventListener('click', function() {
            resetServiceForm();
            document.querySelector('.menu-item[data-tab="services-list"]').click();
        });
    }
    
    // Load services data
    if (typeof loadServicesAdmin === 'function') {
        loadServicesAdmin();
    }
    
    // Load projects data
    if (typeof loadProjectsAdmin === 'function') {
        loadProjectsAdmin();
    }
    
    // Register project form submit handler
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectFormSubmit);
    }
    
    // Register project cancel button
    const projectCancelBtn = document.getElementById('project-cancel-btn');
    if (projectCancelBtn) {
        projectCancelBtn.addEventListener('click', function() {
            resetProjectForm();
            document.querySelector('.menu-item[data-tab="projects-list"]').click();
        });
    }
    
    // Set today's date for project form
    const projectDateInput = document.getElementById('project-date');
    if (projectDateInput) {
        projectDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Initialize project editor
    const projectEditor = document.getElementById('project-editor');
    if (projectEditor && !projectEditor.innerHTML.trim()) {
        projectEditor.innerHTML = '<p>Nhập nội dung dự án tại đây...</p>';
    }
});

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

const SESSION_KEY = 'eratech_admin_session';

// Display logged in username
function displayUsername() {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = sessionData.user;
            }
        } catch (e) {
            console.error('Error reading session:', e);
        }
    }
}

// Logout function
function adminLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'admin-login.html';
    }
}

// Check session periodically
function startSessionCheck() {
    setInterval(function() {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = 'admin-login.html';
            return;
        }
        
        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            
            if (sessionData.expiry <= now) {
                localStorage.removeItem(SESSION_KEY);
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = 'admin-login.html';
            }
        } catch (e) {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'admin-login.html';
        }
    }, 60000); // Check every minute
}

// Initialize authentication on load
window.addEventListener('load', function() {
    displayUsername();
    startSessionCheck();
});


// Initialize recruitment when window loads
window.addEventListener('load', function() {
    // Set today's date for job form
    const jobDateInput = document.getElementById('job-date');
    if (jobDateInput) {
        jobDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Set deadline to 30 days from now
    const jobDeadlineInput = document.getElementById('job-deadline');
    if (jobDeadlineInput) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);
        jobDeadlineInput.value = deadline.toISOString().split('T')[0];
    }
    
    // Initialize job editor
    const jobEditor = document.getElementById('job-editor');
    if (jobEditor && !jobEditor.innerHTML.trim()) {
        jobEditor.innerHTML = '<p>Nhập nội dung tại đây...</p>';
    }
    
    // Register job form submit handler
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', handleJobFormSubmit);
    }
    
    // Register job cancel button
    const jobCancelBtn = document.getElementById('job-cancel-btn');
    if (jobCancelBtn) {
        jobCancelBtn.addEventListener('click', function() {
            resetJobForm();
            document.querySelector('.menu-item[data-tab="jobs-list"]').click();
        });
    }
    
    // Load jobs data
    if (typeof loadJobsAdmin === 'function') {
        loadJobsAdmin();
    }
    
    // Initialize investment editor
    const investmentEditor = document.getElementById('investment-editor');
    if (investmentEditor) {
        investmentEditor.innerHTML = '<p>Nhập nội dung tại đây...</p>';
    }
    
    // Register investment form submit handler
    const investmentForm = document.getElementById('investment-form');
    if (investmentForm) {
        investmentForm.addEventListener('submit', handleInvestmentFormSubmit);
    }
    
    // Register investment cancel button
    const investmentCancelBtn = document.getElementById('investment-cancel-btn');
    if (investmentCancelBtn) {
        investmentCancelBtn.addEventListener('click', function() {
            resetInvestmentForm();
            document.querySelector('.menu-item[data-tab="investments-list"]').click();
        });
    }
    
    // Load investments data
    if (typeof loadInvestmentsAdmin === 'function') {
        loadInvestmentsAdmin();
    }
});


// Export all data at once
function exportAllData() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Export hero media
    if (typeof heroMediaItems !== 'undefined' && heroMediaItems.length > 0) {
        const heroStr = JSON.stringify({ heroMedia: heroMediaItems }, null, 2);
        downloadJSON(heroStr, `hero-media-data-${timestamp}.json`);
    }
    
    // Export about video
    if (typeof aboutVideoData !== 'undefined' && Object.keys(aboutVideoData).length > 0) {
        const aboutVideoStr = JSON.stringify({ aboutVideo: aboutVideoData }, null, 2);
        downloadJSON(aboutVideoStr, `about-video-data-${timestamp}.json`);
    }
    
    // Export news
    if (typeof articles !== 'undefined' && articles.length > 0) {
        const newsStr = JSON.stringify({ articles: articles }, null, 2);
        downloadJSON(newsStr, `news-data-${timestamp}.json`);
    }
    
    // Export services
    if (typeof servicesData !== 'undefined' && servicesData.length > 0) {
        const servicesStr = JSON.stringify({ services: servicesData }, null, 2);
        downloadJSON(servicesStr, `services-data-${timestamp}.json`);
    }
    
    // Export projects
    const projectsStored = localStorage.getItem('projects');
    if (projectsStored) {
        const projects = JSON.parse(projectsStored);
        const projectsStr = JSON.stringify({ projects: projects }, null, 2);
        downloadJSON(projectsStr, `projects-data-${timestamp}.json`);
    }
    
    // Export jobs
    if (typeof jobsData !== 'undefined' && jobsData.length > 0) {
        const jobsStr = JSON.stringify({ jobs: jobsData }, null, 2);
        downloadJSON(jobsStr, `recruitment-data-${timestamp}.json`);
    }
    
    showAlert('Đã xuất tất cả dữ liệu thành công!', 'success');
}

// Helper function to download JSON
function downloadJSON(dataStr, filename) {
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// ============================================
// IMAGE UPLOAD TO SERVER FUNCTIONS
// ============================================

const UPLOAD_API_BASE = 'http://localhost:3000';

/**
 * Upload image to server
 * @param {string} base64Image - Base64 encoded image data
 * @param {string} folder - Optional subfolder (e.g., 'banners', 'news', 'services')
 * @returns {Promise<{success: boolean, path: string, error?: string}>}
 */
async function uploadImageToServer(base64Image, folder = '') {
    try {
        // Check if it's already a server path (not base64)
        if (!base64Image || !base64Image.startsWith('data:image')) {
            console.log('Image is already a path or empty, skipping upload:', base64Image ? base64Image.substring(0, 50) : 'empty');
            return { success: true, path: base64Image || '', isExisting: true };
        }
        
        console.log(`Uploading image to folder: ${folder}, size: ${(base64Image.length / 1024).toFixed(0)}KB`);
        
        const response = await fetch(UPLOAD_API_BASE + '/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: base64Image,
                folder: folder
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`Image uploaded to server: ${result.path}`);
            return { success: true, path: result.path };
        } else {
            console.error('Upload failed:', result.message);
            return { success: false, error: result.message };
        }
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload multiple images to server
 * @param {string[]} base64Images - Array of base64 encoded images
 * @param {string} folder - Optional subfolder
 * @returns {Promise<{success: boolean, paths: string[], errors?: string[]}>}
 */
async function uploadMultipleImagesToServer(base64Images, folder = '') {
    try {
        const newImages = base64Images.filter(img => img.startsWith('data:image'));
        const existingPaths = base64Images.filter(img => !img.startsWith('data:image'));
        
        if (newImages.length === 0) {
            return { success: true, paths: existingPaths };
        }
        
        const response = await fetch(UPLOAD_API_BASE + '/api/upload-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                images: newImages,
                folder: folder
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const uploadedPaths = result.results
                .filter(r => r.success)
                .map(r => r.path);
            return { success: true, paths: [...existingPaths, ...uploadedPaths] };
        } else {
            return { success: false, error: result.message, paths: existingPaths };
        }
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message, paths: [] };
    }
}

/**
 * Process and upload image from file input
 * @param {File} file - File object from input
 * @param {string} folder - Optional subfolder
 * @param {number} maxWidth - Max width for compression
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<{success: boolean, path: string, error?: string}>}
 */
async function processAndUploadImage(file, folder = '', maxWidth = 800, quality = 0.8) {
    try {
        // Compress image first
        const compressedData = await compressImage(file, maxWidth, quality);
        
        // Upload to server
        const result = await uploadImageToServer(compressedData, folder);
        
        return result;
    } catch (error) {
        console.error('Process and upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete image from server
 * @param {string} imagePath - Path to image (e.g., 'images/uploads/banners/img_123.jpg')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteImageFromServer(imagePath) {
    try {
        // Only delete uploaded images
        if (!imagePath.startsWith('images/uploads/')) {
            return { success: false, error: 'Can only delete uploaded images' };
        }
        
        const response = await fetch(UPLOAD_API_BASE + '/api/delete-image', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: imagePath })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}
