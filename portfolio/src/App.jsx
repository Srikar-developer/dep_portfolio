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
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

function setTheme(theme) {
  htmlElement.setAttribute('data-theme', theme);
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
  localStorage.setItem('theme', theme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// ==================== MOBILE NAVIGATION ====================
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

// ==================== ENHANCED CHATBOT ====================
const chatbotBtn = document.getElementById('chatbot-btn');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotTyping = document.getElementById('chatbot-typing');

// Enhanced chatbot responses
const chatbotResponses = {
  "experience": {
    text: "I have exciting experience in tech! 🚀\n\n• Currently working as ServiceNow Virtual Intern\n• Achieved Top 10 rank at HackIndia 2025 among 300+ teams\n• Pursuing B.Tech in IT with 7.39 CGPA\n• Led teams in competitive hackathons\n\nWould you like to know more about any specific experience?",
    suggestions: ["Tell me about HackIndia", "ServiceNow internship details"]
  },
  "skills": {
    text: "I'm skilled in multiple technologies! 💻\n\n🔹 Frontend: React.js, HTML5, CSS3, JavaScript\n🔹 Backend: Node.js, Express.js, MongoDB, MySQL\n🔹 Languages: Java, Python, C, JavaScript (ES6+)\n🔹 Cloud & Tools: Salesforce (Certified), ServiceNow, Git\n\nI specialize in building full-stack MERN applications!",
    suggestions: ["Tell me about your certifications", "What projects have you built?"]
  },
  "projects": {
    text: "I've built some amazing projects! 🎯\n\n1️⃣ Academic Panel Control - Full MERN stack app with JWT auth\n2️⃣ Smart Presentation Generator - AI-powered tool (HackIndia Top 10)\n3️⃣ Various responsive web applications\n\nEach project showcases different aspects of my full-stack expertise!",
    suggestions: ["Academic Panel details", "Smart Presentation Generator"]
  },
  "contact": {
    text: "Let's connect! 📬\n\n📧 Email: srikarpuyal.me@gmail.com\n📱 Phone: +91 6374675941\n📍 Location: Namakkal, Tamil Nadu, India\n\nYou can also find me on:\n• LinkedIn • GitHub • Twitter • Instagram • Facebook\n\nFeel free to reach out anytime!",
    suggestions: ["Download resume", "View social profiles"]
  },
  "hackindia": {
    text: "HackIndia 2025 was an incredible achievement! 🏆\n\n• Ranked Top 10 among 300+ teams nationwide\n• Developed Smart Presentation Generator using AI\n• Led a talented team through intense competition\n• Showcased innovation in AI & Web3 space\n\nIt was India's largest AI & Web3 hackathon!",
    suggestions: ["What did you learn?", "Tell me about your team"]
  },
  "certifications": {
    text: "I hold important certifications! 📜\n\n✅ Salesforce Certified Agentforce Specialist\n✅ ServiceNow Virtual Internship Certificate\n✅ HackIndia 2025 Top 10 Finalist\n\nThese certifications demonstrate my commitment to continuous learning!",
    suggestions: ["Salesforce certification details", "View all achievements"]
  },
  "academic": {
    text: "About Academic Panel Control: 🎓\n\n• Full-stack MERN application\n• Automates college exam operations\n• Features: JWT auth, role-based access, automated results\n• Dynamic PDF hall ticket generation\n• Real-time dashboard analytics\n\nIt's a comprehensive solution for educational institutions!",
    suggestions: ["Technical stack used", "View other projects"]
  }
};

// Function to add message with avatar
function addMessage(text, isUser = false, showSuggestions = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
  
  const content = document.createElement('div');
  content.className = 'message-content';
  
  // Convert line breaks to paragraphs
  const paragraphs = text.split('\n\n').map(para => {
    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
  }).join('');
  
  content.innerHTML = paragraphs;
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  if (chatbotMessages) chatbotMessages.appendChild(messageDiv);
  
  // Add suggestions if provided
  if (showSuggestions && showSuggestions.length > 0) {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'chat-quick-replies';
    suggestionsDiv.style.marginTop = '12px';
    
    showSuggestions.forEach(suggestion => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.innerHTML = `<i class="fas fa-arrow-right"></i> ${suggestion}`;
      btn.addEventListener('click', () => {
        handleUserMessage(suggestion);
      });
      suggestionsDiv.appendChild(btn);
    });
    
    if (chatbotMessages) chatbotMessages.appendChild(suggestionsDiv);
  }

  if (chatbotMessages) chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
  if (chatbotTyping) chatbotTyping.classList.add('active');
  if (chatbotMessages) chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  if (chatbotTyping) chatbotTyping.classList.remove('active');
}

// Get bot response based on user message
function getBotResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // Check for specific keywords
  if (msg.includes('experience') || msg.includes('work') || msg.includes('internship') || msg.includes('education')) {
    return chatbotResponses.experience;
  } else if (msg.includes('skill') || msg.includes('technology') || msg.includes('tech') || msg.includes('stack')) {
    return chatbotResponses.skills;
  } else if (msg.includes('project') || msg.includes('portfolio') || msg.includes('built') || msg.includes('developed')) {
    return chatbotResponses.projects;
  } else if (msg.includes('contact') || msg.includes('email') || msg.includes('phone') || msg.includes('reach')) {
    return chatbotResponses.contact;
  } else if (msg.includes('hackindia') || msg.includes('hack india') || msg.includes('hackathon')) {
    return chatbotResponses.hackindia;
  } else if (msg.includes('certif') || msg.includes('salesforce') || msg.includes('servicenow')) {
    return chatbotResponses.certifications;
  } else if (msg.includes('academic panel') || msg.includes('academic')) {
    return chatbotResponses.academic;
  } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('hii')) {
    return {
      text: "Hello! 👋 I'm Srikar's virtual assistant. I'm here to help you learn more about his experience, skills, projects, and achievements. What would you like to know?",
      suggestions: ["Tell me about your experience", "What are your skills?", "Show me your projects"]
    };
  } else if (msg.includes('thank') || msg.includes('thanks')) {
    return {
      text: "You're very welcome! 😊 Is there anything else you'd like to know about Srikar's work or achievements?",
      suggestions: ["View certifications", "How can I contact you?"]
    };
  } else if (msg.includes('resume') || msg.includes('cv')) {
    return {
      text: "You can download Srikar's resume from the Contact section below! 📄 Just scroll down and click the 'Download Resume' button.",
      suggestions: ["How can I contact you?", "Tell me about your experience"]
    };
  } else {
    return {
      text: "I'd be happy to help you learn more about Srikar! Here's what I can tell you about:\n\n💼 Experience & Education\n💻 Technical Skills\n🚀 Projects & Achievements\n📜 Certifications\n📧 Contact Information\n\nWhat interests you?",
      suggestions: ["Tell me about your experience", "What are your skills?", "Show me your projects", "How can I contact you?"]
    };
  }
}

// Handle user message
function handleUserMessage(message) {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return;
  
  // Add user message
  addMessage(trimmedMessage, true);
  
  // Clear input
  if (chatbotInput) {
    chatbotInput.value = '';
  }
  
  // Show typing indicator
  showTyping();
  
  // Simulate processing delay
  setTimeout(() => {
    hideTyping();
    const response = getBotResponse(trimmedMessage);
    addMessage(response.text, false, response.suggestions);
  }, 800 + Math.random() * 400);
}

// Chatbot event listeners
if (chatbotBtn) {
  chatbotBtn.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
    if (chatbotWindow.classList.contains('active')) {
      chatbotInput.focus();
    }
  });
}

if (chatbotClose) {
  chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
  });
}

if (chatbotSend) {
  chatbotSend.addEventListener('click', () => {
    handleUserMessage(chatbotInput.value);
  });
}

if (chatbotInput) {
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserMessage(chatbotInput.value);
    }
  });
}

// Quick reply buttons
document.querySelectorAll('.quick-reply-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const reply = btn.getAttribute('data-reply');
    handleUserMessage(reply);
  });
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

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (hamburger && navMenu && navMenu.classList.contains('active')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
    if (chatbotWindow && chatbotWindow.classList.contains('active')) {
      chatbotWindow.classList.remove('active');
    }
  }
});

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
  
  // Portfolio loaded
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
  const chatbotWidget = document.querySelector('.chatbot-widget');
  if (chatbotWidget) chatbotWidget.style.display = 'none';
});

window.addEventListener('afterprint', () => {
  if (header) header.style.position = 'fixed';
  const chatbotWidget = document.querySelector('.chatbot-widget');
  if (chatbotWidget) chatbotWidget.style.display = 'block';
});