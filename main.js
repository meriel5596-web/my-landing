/* ========================================
   MERIELINVENTORY - Main JavaScript
   ======================================== */

// ========================================
// 1. Global Variables & Configuration
// ========================================
const API_BASE = 'tables';
const TABLES = {
    INQUIRIES: 'inquiries',
    REVIEWS: 'reviews',
    REFERENCES: 'references'
};

// ========================================
// 2. Navigation & Scroll Effects
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initForms();
    loadData();
});

// Initialize Navigation
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling and active link handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close mobile menu if open
                navMenu.classList.remove('active');
                
                // Scroll to section
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            
            if (window.pageYOffset >= (sectionTop - navbarHeight - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize Scroll Effects
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    window.addEventListener('scroll', () => {
        // Navbar background on scroll
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(26, 54, 93, 0.98)';
        } else {
            navbar.style.background = 'rgba(26, 54, 93, 0.95)';
        }
        
        // Show/hide scroll to top button
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// 3. Forms Initialization
// ========================================
function initForms() {
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Review Form
    const reviewForm = document.getElementById('addReviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
    
    // Reference Form
    const referenceForm = document.getElementById('addReferenceForm');
    if (referenceForm) {
        referenceForm.addEventListener('submit', handleReferenceSubmit);
    }
    
    // Toggle Reference Form
    const toggleReferenceBtn = document.getElementById('toggleReferenceForm');
    const referenceFormContainer = document.getElementById('referenceForm');
    if (toggleReferenceBtn && referenceFormContainer) {
        toggleReferenceBtn.addEventListener('click', () => {
            const isVisible = referenceFormContainer.style.display !== 'none';
            referenceFormContainer.style.display = isVisible ? 'none' : 'block';
            toggleReferenceBtn.innerHTML = isVisible ? 
                '<i class="fas fa-plus"></i> 레퍼런스 추가' : 
                '<i class="fas fa-minus"></i> 취소';
        });
    }
}

// ========================================
// 4. Data Loading Functions
// ========================================
async function loadData() {
    await loadReferences();
    await loadReviews();
    await loadInquiries();
}

// Load References
async function loadReferences() {
    try {
        const response = await fetch(`${API_BASE}/${TABLES.REFERENCES}?limit=100&sort=-created_at`);
        const data = await response.json();
        
        const referencesGrid = document.getElementById('referencesGrid');
        if (!referencesGrid) return;
        
        if (data.data && data.data.length > 0) {
            referencesGrid.innerHTML = data.data.map(ref => createReferenceCard(ref)).join('');
        } else {
            referencesGrid.innerHTML = '<p class="text-center">레퍼런스가 아직 없습니다.</p>';
        }
    } catch (error) {
        console.error('Error loading references:', error);
        showNotification('레퍼런스를 불러오는데 실패했습니다.', 'error');
    }
}

// Create Reference Card HTML
function createReferenceCard(reference) {
    return `
        <div class="reference-card">
            <div class="reference-header">
                <h3>${escapeHtml(reference.project_name)}</h3>
                <div class="reference-meta">
                    <span><i class="fas fa-building"></i> ${escapeHtml(reference.company)}</span>
                    <span><i class="fas fa-calendar"></i> ${escapeHtml(reference.period)}</span>
                </div>
            </div>
            <p class="reference-description">${escapeHtml(reference.description)}</p>
            ${reference.achievements ? `
                <div class="reference-achievements">
                    <strong><i class="fas fa-trophy"></i> 주요 성과</strong>
                    <p>${escapeHtml(reference.achievements)}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Load Reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API_BASE}/${TABLES.REVIEWS}?limit=100&sort=-created_at`);
        const data = await response.json();
        
        const reviewsGrid = document.getElementById('reviewsGrid');
        if (!reviewsGrid) return;
        
        // Filter approved reviews
        const approvedReviews = data.data ? data.data.filter(review => review.is_approved) : [];
        
        if (approvedReviews.length > 0) {
            reviewsGrid.innerHTML = approvedReviews.map(review => createReviewCard(review)).join('');
        } else {
            reviewsGrid.innerHTML = '<p class="text-center">아직 작성된 리뷰가 없습니다. 첫 리뷰를 남겨주세요!</p>';
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        showNotification('리뷰를 불러오는데 실패했습니다.', 'error');
    }
}

// Create Review Card HTML
function createReviewCard(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <h4>${escapeHtml(review.name)}</h4>
                    ${review.company ? `<p>${escapeHtml(review.company)}</p>` : ''}
                </div>
                <div class="review-rating">
                    ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                </div>
            </div>
            <p class="review-content">"${escapeHtml(review.content)}"</p>
        </div>
    `;
}

// Load Inquiries (Admin View)
async function loadInquiries() {
    try {
        const response = await fetch(`${API_BASE}/${TABLES.INQUIRIES}?limit=100&sort=-submitted_at`);
        const data = await response.json();
        
        const inquiriesGrid = document.getElementById('inquiriesGrid');
        if (!inquiriesGrid) return;
        
        if (data.data && data.data.length > 0) {
            inquiriesGrid.innerHTML = data.data.map(inquiry => createInquiryCard(inquiry)).join('');
        } else {
            inquiriesGrid.innerHTML = '<p class="text-center">문의가 아직 없습니다.</p>';
        }
    } catch (error) {
        console.error('Error loading inquiries:', error);
    }
}

// Create Inquiry Card HTML
function createInquiryCard(inquiry) {
    const statusText = {
        'pending': '대기중',
        'in_progress': '처리중',
        'completed': '완료'
    };
    
    const typeText = {
        'consulting': '컨설팅',
        'education': '교육',
        'collaboration': '협업',
        'other': '기타'
    };
    
    return `
        <div class="inquiry-card">
            <div class="inquiry-header">
                <div class="inquiry-info">
                    <h4>${escapeHtml(inquiry.subject)}</h4>
                    <div class="inquiry-meta">
                        <span><i class="fas fa-user"></i> ${escapeHtml(inquiry.name)}</span>
                        ${inquiry.company ? `<span><i class="fas fa-building"></i> ${escapeHtml(inquiry.company)}</span>` : ''}
                        <span><i class="fas fa-envelope"></i> ${escapeHtml(inquiry.email)}</span>
                        <span><i class="fas fa-phone"></i> ${escapeHtml(inquiry.phone)}</span>
                        <span><i class="fas fa-tag"></i> ${typeText[inquiry.inquiry_type] || inquiry.inquiry_type}</span>
                    </div>
                </div>
                <span class="inquiry-status ${inquiry.status || 'pending'}">
                    ${statusText[inquiry.status] || '대기중'}
                </span>
            </div>
            <p class="inquiry-content">${escapeHtml(inquiry.message)}</p>
        </div>
    `;
}

// ========================================
// 5. Form Submit Handlers
// ========================================

// Handle Contact Form Submit
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        inquiry_type: formData.get('inquiry_type'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        status: 'pending',
        submitted_at: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/${TABLES.INQUIRIES}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.', 'success');
            e.target.reset();
            await loadInquiries();
        } else {
            throw new Error('Failed to submit inquiry');
        }
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        showNotification('문의 접수에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// Handle Review Form Submit
async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        company: formData.get('company'),
        rating: parseInt(formData.get('rating')),
        content: formData.get('content'),
        is_approved: true, // Auto-approve for demo purposes
        created_at: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/${TABLES.REVIEWS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('리뷰가 성공적으로 등록되었습니다. 감사합니다!', 'success');
            e.target.reset();
            await loadReviews();
        } else {
            throw new Error('Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('리뷰 등록에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// Handle Reference Form Submit
async function handleReferenceSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        project_name: formData.get('project_name'),
        company: formData.get('company'),
        period: formData.get('period'),
        description: formData.get('description'),
        achievements: formData.get('achievements'),
        is_featured: true,
        created_at: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/${TABLES.REFERENCES}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('레퍼런스가 성공적으로 추가되었습니다.', 'success');
            e.target.reset();
            document.getElementById('referenceForm').style.display = 'none';
            document.getElementById('toggleReferenceForm').innerHTML = '<i class="fas fa-plus"></i> 레퍼런스 추가';
            await loadReferences();
        } else {
            throw new Error('Failed to add reference');
        }
    } catch (error) {
        console.error('Error adding reference:', error);
        showNotification('레퍼런스 추가에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// ========================================
// 6. Utility Functions
// ========================================

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" style="font-size: 1.5rem;"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ========================================
// 7. Animation Styles (injected)
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// 8. Console Welcome Message
// ========================================
console.log('%c🚢 MERIELINVENTORY - Logistics Expert Platform', 'color: #d4af37; font-size: 20px; font-weight: bold;');
console.log('%cPowered by 김희정 - 20년+ 물류 전문가', 'color: #1a365d; font-size: 14px;');
console.log('%c📧 Contact: Meriel5596@gmail.com', 'color: #4a5568; font-size: 12px;');
