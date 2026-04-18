// ==================== CONFIGURATION ====================
// Development: requests go directly to the Express backend on port 3001 (CORS is enabled in server.js)
// Production: update the second value to your deployed backend URL, e.g. 'https://my-portfolio-api.onrender.com'
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : window.location.origin; // Uses same domain as frontend in production

// ==================== TYPING ANIMATION DATA ====================
const roles = [
  "MERN Stack Developer",
  "Salesforce Certified Professional",
  "Full Stack Developer",
  "AI/ML Enthusiast",
  "Problem Solver",
  "HackIndia Top 10 Finalist"
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = 50;
const pauseTime = 2000;

function typeRole() {
  const typingText = document.getElementById('typing-text');
  if (!typingText) return;

  const currentRole = roles[roleIndex];

  if (isDeleting) {
    typingText.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingText.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? deletingSpeed : typingSpeed;

  if (!isDeleting && charIndex === currentRole.length) {
    speed = pauseTime;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    speed = 500;
  }

  setTimeout(typeRole, speed);
}

// ==================== THEME TOGGLE ====================
const htmlElement = document.documentElement;

function setTheme(theme) {
  htmlElement.setAttribute('data-theme', theme);
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
  localStorage.setItem('theme', theme);
}

// Load saved theme immediately (before DOMContentLoaded so there's no flash)
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// ==================== PREVENT FORM RESUBMISSION ====================
if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

// ==================== DEBOUNCE UTILITY ====================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==================== FIELD VALIDATION ====================
function validateField(field) {
  const formGroup = field.parentElement;

  if (field.value.trim() === '') {
    formGroup.classList.add('error');
    return false;
  }

  if (field.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(field.value)) {
      formGroup.classList.add('error');
      return false;
    }
  }

  if (field.id === 'message' && field.value.trim().length < 10) {
    formGroup.classList.add('error');
    return false;
  }

  formGroup.classList.remove('error');
  return true;
}

// ==================== INITIALIZATION (DOM-SAFE) ====================
document.addEventListener('DOMContentLoaded', () => {

  // ── Typing animation ──────────────────────────────────────────────
  typeRole();

  // ── Theme toggle button ───────────────────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // ── Smooth scrolling ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));

      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Active navigation ─────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  updateActiveNav();
  window.addEventListener('scroll', debounce(updateActiveNav, 100));

  // ── Scroll animations (IntersectionObserver) ─────────────────────
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section, .timeline-item, .project-card, .cert-card').forEach(el => {
    observer.observe(el);
  });

  // ── Contact form ──────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  const messageTextarea = document.getElementById('message');
  const charCount = document.getElementById('char-count');

  // ── Auto-save form to localStorage ────────────────────────────────
  function saveDraft() {
    const formData = {
      name: document.getElementById('name')?.value || '',
      email: document.getElementById('email')?.value || '',
      subject: document.getElementById('subject')?.value || '',
      message: document.getElementById('message')?.value || '',
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('portfolioFormDraft', JSON.stringify(formData));
  }

  function loadDraft() {
    const draft = localStorage.getItem('portfolioFormDraft');
    if (draft) {
      try {
        const formData = JSON.parse(draft);
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const subjectField = document.getElementById('subject');
        const messageField = document.getElementById('message');

        if (nameField) nameField.value = formData.name;
        if (emailField) emailField.value = formData.email;
        if (subjectField) subjectField.value = formData.subject;
        if (messageField) messageField.value = formData.message;

        if (messageField && charCount) {
          charCount.textContent = formData.message.length;
        }
      } catch {
        console.log('Could not restore draft');
      }
    }
  }

  // Load draft on page load
  if (contactForm) {
    loadDraft();
  }

  // Character counter for message field
  if (messageTextarea && charCount) {
    messageTextarea.addEventListener('input', function () {
      const length = this.value.length;
      charCount.textContent = length;

      if (length > 900) {
        charCount.style.color = 'var(--danger-color)';
      } else if (length > 750) {
        charCount.style.color = 'var(--accent-color)';
      } else {
        charCount.style.color = 'var(--text-secondary)';
      }

      // Auto-save draft on input
      saveDraft();
    });
  }

  // Real-time field validation
  const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');

  formInputs.forEach(input => {
    input.addEventListener('blur', function () {
      validateField(this);
    });

    input.addEventListener('input', function () {
      if (this.parentElement.classList.contains('error')) {
        validateField(this);
      }
      // Auto-save draft on input
      saveDraft();
    });
  });

  // Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validate all fields
      let isValid = true;
      formInputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        formMessage.style.display = 'flex';
        formMessage.className = 'form-message error';
        formMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields correctly.';

        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const submitButton = this.querySelector('button[type="submit"]');
      const originalButtonHTML = submitButton.innerHTML;

      submitButton.innerHTML = '<span class="loading-spinner"></span> Sending...';
      submitButton.disabled = true;

      // Hide any previous message
      formMessage.style.display = 'none';
      formMessage.className = 'form-message';

      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };

      try {
        const apiUrl = `${API_BASE_URL}/api/contact`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        // Check if response is valid before parsing JSON
        let result = {};
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        if (response.ok && result.success) {
          formMessage.style.display = 'flex';
          formMessage.className = 'form-message success';
          formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Message sent! I\'ll get back to you within 24–48 hours.';

          contactForm.reset();
          if (charCount) charCount.textContent = '0';
          formInputs.forEach(input => input.parentElement.classList.remove('error'));
          localStorage.removeItem('portfolioFormDraft');

          setTimeout(() => {
            formMessage.style.display = 'none';
          }, 8000);
        } else {
          throw new Error(result.error || 'Failed to send message. Please try again.');
        }

      } catch (error) {
        console.error('Contact form error:', error);

        // Check if it's a network error (offline)
        const isNetworkError = !navigator.onLine || error.message.includes('Failed to fetch');
        const emailAddress = 'srikarpuyal.me@gmail.com';

        formMessage.style.display = 'flex';
        formMessage.className = 'form-message error';

        if (isNetworkError) {
          // Offline mode: Show draft saved message and email fallback
          formMessage.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;flex-direction:column;">
              <div style="display:flex;gap:12px;align-items:flex-start;">
                <i class="fas fa-wifi-slash" style="margin-top:2px;"></i>
                <span><strong>You're offline.</strong> Your message has been saved. You can:</span>
              </div>
              <ol style="margin-left:28px;color:inherit;line-height:1.6;">
                <li>Come back when online to send it automatically</li>
                <li>Or email me directly at <a href="mailto:${emailAddress}" style="color:inherit;text-decoration:underline;font-weight:700;">${emailAddress}</a> with your message</li>
              </ol>
            </div>
          `;
        } else {
          // Server error: Show detailed fallback
          let errorMsg = error.message || 'Failed to send message.';

          // Check if it's a backend connection error
          if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Backend')) {
            errorMsg = 'Cannot connect to backend server. Please ensure the server is running.';
          }

          formMessage.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <i class="fas fa-exclamation-circle" style="margin-top:2px;"></i>
              <span>${errorMsg} Please try again or email me at
              <a href="mailto:${emailAddress}" style="color:inherit;text-decoration:underline;font-weight:700;">${emailAddress}</a>.</span>
            </div>
          `;
        }
      } finally {
        submitButton.innerHTML = originalButtonHTML;
        submitButton.disabled = false;
      }
    });
  }

  // ── Back to Top button ────────────────────────────────────────────
  const backToTopButton = document.getElementById('back-to-top');

  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      backToTopButton.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ── Header shadow on scroll ───────────────────────────────────────
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 4px 20px rgba(0, 0, 0, 0.1)'
        : '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    });
  }

  // ── Mobile navigation ─────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  // ── Keyboard navigation ───────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const kb_hamburger = document.getElementById('hamburger');
    const kb_navMenu = document.getElementById('nav-menu');
    if (e.key === 'Escape') {
      if (kb_hamburger && kb_navMenu && kb_navMenu.classList.contains('active')) {
        kb_hamburger.classList.remove('active');
        kb_navMenu.classList.remove('active');
      }
    }
  });

  // ── External links ────────────────────────────────────────────────
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.hasAttribute('target')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ── Online/Offline Status Detection ────────────────────────────────
  function createStatusBanner(isOnline) {
    let banner = document.getElementById('online-status-banner');

    if (isOnline) {
      if (banner) {
        banner.remove();
      }
    } else {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'online-status-banner';
        banner.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 12px 20px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          animation: slideDown 0.3s ease-out;
        `;
        banner.innerHTML = '<i class="fas fa-wifi-slash"></i> You are offline – messages will be saved locally';

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-100%); opacity: 0; }
          }
        `;
        if (!document.querySelector('style[data-status-banner]')) {
          style.setAttribute('data-status-banner', 'true');
          document.head.appendChild(style);
        }

        document.body.insertBefore(banner, document.body.firstChild);
      }
    }
  }

  // Check initial status
  createStatusBanner(navigator.onLine);

  // Listen for online/offline events
  window.addEventListener('online', () => {
    createStatusBanner(true);
    console.log('✅ Back online');
  });

  window.addEventListener('offline', () => {
    createStatusBanner(false);
    console.log('⚠️ You are offline');
  });

  // ── Print-friendly ────────────────────────────────────────────────
  const backToTop = document.getElementById('back-to-top');
  const headerEl = document.getElementById('header');

  window.addEventListener('beforeprint', () => {
    if (backToTop) backToTop.style.display = 'none';
    if (headerEl) headerEl.style.position = 'relative';
  });

  window.addEventListener('afterprint', () => {
    if (headerEl) headerEl.style.position = 'fixed';
  });

}); // end DOMContentLoaded