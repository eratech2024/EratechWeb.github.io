// Mobile Menu - Production Clean Version
(function() {
    'use strict';
    
    let isInitialized = false;
    let initAttempts = 0;
    const maxAttempts = 30;
    
    function initMobileMenu() {
        if (isInitialized) return;
        
        const toggle = document.getElementById('mobile-menu-toggle');
        const navBar = document.querySelector('.nav-bar');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!toggle || !navBar || !navMenu) {
            initAttempts++;
            if (initAttempts < maxAttempts) {
                setTimeout(initMobileMenu, 100);
            }
            return;
        }
        
        // Check if menu items are loaded
        const navItems = navBar.querySelectorAll('.nav-item');
        if (navItems.length === 0) {
            initAttempts++;
            if (initAttempts < maxAttempts) {
                setTimeout(initMobileMenu, 100);
            }
            return;
        }
        
        isInitialized = true;
        
        // Remove any existing overlays first
        document.querySelectorAll('.mobile-menu-overlay').forEach(el => el.remove());
        
        // Create single overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
        
        // Create close button if not exists
        let closeBtn = navBar.querySelector('.mobile-close');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.className = 'mobile-close';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.setAttribute('aria-label', 'Đóng menu');
            navBar.appendChild(closeBtn);
        }
        
        let isMenuOpen = false;
        
        function openMenu() {
            navBar.classList.add('active');
            overlay.classList.add('active');
            toggle.classList.add('active');
            document.body.style.overflow = 'hidden';
            isMenuOpen = true;
        }
        
        function closeMenu() {
            navBar.classList.remove('active');
            overlay.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
            isMenuOpen = false;
            // Close all dropdowns when menu closes
            navBar.querySelectorAll('.nav-item.dropdown-open').forEach(function(item) {
                item.classList.remove('dropdown-open');
            });
        }
        
        // Toggle button
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Close button
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
        });
        
        // Overlay click
        overlay.addEventListener('click', function() {
            closeMenu();
        });
        
        // Handle dropdown toggle - click on arrow OR on nav-link with dropdown
        navBar.querySelectorAll('.nav-item').forEach(function(navItem) {
            const dropdown = navItem.querySelector('.dropdown');
            const navLink = navItem.querySelector('.nav-link');
            const arrow = navItem.querySelector('.arrow');
            const hasDropdown = navItem.classList.contains('has-dropdown') || dropdown;
            
            if (hasDropdown && navLink) {
                // Click on arrow toggles dropdown
                if (arrow) {
                    arrow.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDropdown(navItem);
                    });
                }
                
                // Click on nav-link text area also toggles dropdown (not navigate)
                navLink.addEventListener('click', function(e) {
                    // Only on mobile
                    if (window.innerWidth > 767) return;
                    
                    // If clicking on arrow, let arrow handler deal with it
                    if (e.target.closest('.arrow')) return;
                    
                    e.preventDefault();
                    e.stopPropagation();
                    toggleDropdown(navItem);
                });
            }
        });
        
        function toggleDropdown(navItem) {
            const dropdown = navItem.querySelector('.dropdown');
            
            // Close other dropdowns
            navBar.querySelectorAll('.nav-item.dropdown-open').forEach(function(item) {
                if (item !== navItem) {
                    item.classList.remove('dropdown-open');
                    const otherDropdown = item.querySelector('.dropdown');
                    if (otherDropdown) {
                        otherDropdown.style.cssText = 'display: none !important;';
                    }
                }
            });
            
            // Toggle current
            const isOpen = navItem.classList.toggle('dropdown-open');
            
            // Force style change on dropdown using cssText to override !important
            if (dropdown) {
                if (isOpen) {
                    dropdown.style.cssText = 'display: block !important; position: relative !important;';
                } else {
                    dropdown.style.cssText = 'display: none !important;';
                }
            }
        }
        
        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });
        
        // Prevent clicks inside nav-bar from closing menu
        navBar.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initMobileMenu, 150);
        });
    } else {
        setTimeout(initMobileMenu, 150);
    }
    
    window.addEventListener('load', function() {
        setTimeout(initMobileMenu, 150);
    });
    
    window.addEventListener('includesLoaded', function() {
        setTimeout(initMobileMenu, 100);
    });
    
    // Fallback polling
    setTimeout(initMobileMenu, 400);
    setTimeout(initMobileMenu, 800);
    setTimeout(initMobileMenu, 1200);
    
})();
