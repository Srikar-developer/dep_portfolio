// ==================== TYPING ANIMATION ====================
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

// ==================== SMOOTH SCROLLING ====================
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

// ==================== ACTIVE NAVIGATION ====================
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

// Debounce function for performance
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

// Apply debounced scroll handler
window.addEventListener('scroll', debounce(updateActiveNav, 100));

// ==================== SCROLL ANIMATIONS ====================
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

// Observe elements for fade-in animation
document.querySelectorAll('.section, .timeline-item, .project-card, .cert-card').forEach(el => {
  observer.observe(el);
});

// ==================== CONTACT FORM ====================
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const messageTextarea = document.getElementById('message');
const charCount = document.getElementById('char-count');

// Character counter for message field
if (messageTextarea && charCount) {
  messageTextarea.addEventListener('input', function() {
    const length = this.value.length;
    charCount.textContent = length;
    
    if (length > 900) {
      charCount.style.color = 'var(--danger-color)';
    } else if (length > 750) {
      charCount.style.color = 'var(--accent-color)';
    } else {
      charCount.style.color = 'var(--text-secondary)';
    }
  });
}

// Real-time field validation
const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');

formInputs.forEach(input => {
  input.addEventListener('blur', function() {
    validateField(this);
  });
  
  input.addEventListener('input', function() {
    if (this.parentElement.classList.contains('error')) {
      validateField(this);
    }
  });
});

// Field validation function
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

// Form Submission
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    formInputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
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
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };
    
    try {
      // Using FormSubmit.co for zero-config email delivery
      const EMAIL_DESTINATION = 'srikarpuyal.me@gmail.com';

      const response = await fetch(`https://formsubmit.co/ajax/${EMAIL_DESTINATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          _subject: `Portfolio Contact: ${formData.subject}`,
          _replyto: formData.email,
          _template: 'box',
          _captcha: 'false',           // Disable captcha redirect
          _honey: '',                   // Honeypot spam protection
          _autoresponse: `Hi ${formData.name}, thanks for reaching out! I received your message and will get back to you within 24-48 hours. — Srikar`
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      // FormSubmit returns success as the string "true", not a boolean
      if (result.success === 'true' || result.success === true) {
        formMessage.className = 'form-message success';
        formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Message sent successfully! I\'ll get back to you within 24-48 hours.';

        contactForm.reset();
        if (charCount) charCount.textContent = '0';

        formInputs.forEach(input => {
          input.parentElement.classList.remove('error');
        });

        setTimeout(() => {
          formMessage.style.display = 'none';
        }, 8000);
      } else {
        throw new Error(result.message || 'Email service returned an error. Please try again.');
      }

    } catch (error) {
      console.error('Contact form error:', error);

      // Fallback: open the user's email client with prefilled fields
      const mailtoLink = `mailto:srikarpuyal.me@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
      window.location.href = mailtoLink;

      formMessage.className = 'form-message error';
      formMessage.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <i class="fas fa-envelope" style="margin-top:2px;"></i>
          <span>Your email client is opening with the message pre-filled. Alternatively, email me directly at
          <a href="mailto:srikarpuyal.me@gmail.com" style="color:inherit;text-decoration:underline;font-weight:700;">srikarpuyal.me@gmail.com</a>.</span>
        </div>
      `;
    } finally {
      submitButton.innerHTML = originalButtonHTML;
      submitButton.disabled = false;
    }
  });
}

// ==================== BACK TO TOP ====================
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

// ==================== HEADER SHADOW ON SCROLL ====================
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(0, 0, 0, 0.1)'
      : '0 1px 2px 0 rgb(0 0 0 / 0.05)';
  });
}

// (Keyboard navigation moved inside DOMContentLoaded below)

// ==================== PREVENT FORM RESUBMISSION ====================
if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Start typing animation
  typeRole();

  // Update active navigation on load
  updateActiveNav();

  // ==================== THEME TOGGLE (DOM-safe) ====================
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // ==================== MOBILE NAVIGATION (DOM-safe) ====================
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

  // ==================== KEYBOARD NAVIGATION (DOM-safe) ====================
  document.addEventListener('keydown', (e) => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (e.key === 'Escape') {
      if (hamburger && navMenu && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    }
  });
});

// ==================== HANDLE EXTERNAL LINKS ====================
document.querySelectorAll('a[href^="http"]').forEach(link => {
  if (!link.hasAttribute('target')) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
});

// ==================== PRINT-FRIENDLY ====================
window.addEventListener('beforeprint', () => {
  if (backToTopButton) backToTopButton.style.display = 'none';
  if (header) header.style.position = 'relative';
});

window.addEventListener('afterprint', () => {
  if (header) header.style.position = 'fixed';
});