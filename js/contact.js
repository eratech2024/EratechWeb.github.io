// Contact Page JavaScript - Modern Features

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initContactModal();
    initMapTabs();
    initPhoneValidation();
    initEmailValidation();
});

// Contact Modal Handler
function initContactModal() {
    const openBtn = document.getElementById('open-contact-form');
    const closeBtn = document.getElementById('close-contact-modal');
    const modal = document.getElementById('contact-modal');
    const overlay = modal?.querySelector('.contact-modal-overlay');
    
    if (!modal) return;
    
    // Open modal
    if (openBtn) {
        openBtn.addEventListener('click', function() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modal - close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal - overlay click
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    // Close modal - ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Contact Form Handler
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company')?.value || '',
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    
    // Simulate sending (replace with actual API call)
    setTimeout(() => {
        // Save to localStorage for demo
        saveContactMessage(formData);
        
        // Show success message
        showNotification('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.', 'success');
        
        // Close modal if open
        const modal = document.getElementById('contact-modal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Reset form
        e.target.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        
        // Log to console (for demo)
        console.log('Contact form submitted:', formData);
    }, 1500);
}

function saveContactMessage(data) {
    // Get existing messages
    let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Add new message
    messages.push(data);
    
    // Save back to localStorage
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.contact-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `contact-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #195927 0%, #2d8b3d 100%)' : '#dc3545'};
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        max-width: 400px;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 400);
    });
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 5000);
}

// Map Tabs Handler
function initMapTabs() {
    const mapTabs = document.querySelectorAll('.map-tab');
    const mapFrames = document.querySelectorAll('.map-frame');
    
    if (mapTabs.length === 0) return;
    
    mapTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            
            // Update active tab
            mapTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active map
            mapFrames.forEach(frame => {
                frame.classList.remove('active');
                if (frame.id === `map-${location}`) {
                    frame.classList.add('active');
                }
            });
        });
    });
}

// Phone number validation
function initPhoneValidation() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove non-numeric characters except + - ( ) and space
            this.value = this.value.replace(/[^0-9+\-\s()]/g, '');
        });
    }
}

// Email validation
function initEmailValidation() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function(e) {
            const email = this.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email)) {
                this.setCustomValidity('Vui lòng nhập địa chỉ email hợp lệ');
                this.reportValidity();
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// Add input focus effects
document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});
