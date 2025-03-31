// DOM Elements
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links li a');
const skillBars = document.querySelectorAll('.progress');
const form = document.getElementById('contactForm');

// Toggle mobile navigation
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
  
  // Animate hamburger
  const spans = hamburger.querySelectorAll('span');
  if (hamburger.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = 'rotate(0) translate(0)';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'rotate(0) translate(0)';
  }
});

// Close mobile navigation when clicking on a nav item
navItems.forEach(item => {
  item.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'rotate(0) translate(0)';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'rotate(0) translate(0)';
  });
});

// Header scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Animate skill bars on scroll
function animateSkills() {
  skillBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';
    bar.style.width = width;
  });
}

// Intersection Observer for lazy loading and animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('skills')) {
        animateSkills();
      }
      entry.target.classList.add('animated');
    }
  });
}, { threshold: 0.1 });

// Observe sections
document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});

// Simple form validation and submission
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');
    
    // Simple validation
    let valid = true;
    
    if (!nameField.value.trim()) {
      markInvalid(nameField, 'Name cannot be empty');
      valid = false;
    } else {
      markValid(nameField);
    }
    
    if (!emailField.value.trim()) {
      markInvalid(emailField, 'Email cannot be empty');
      valid = false;
    } else if (!isValidEmail(emailField.value)) {
      markInvalid(emailField, 'Please enter a valid email address');
      valid = false;
    } else {
      markValid(emailField);
    }
    
    if (!messageField.value.trim()) {
      markInvalid(messageField, 'Message cannot be empty');
      valid = false;
    } else {
      markValid(messageField);
    }
    
    if (valid) {
      // In a real scenario, you would send the data to a server
      // For now, we'll just simulate success
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      setTimeout(() => {
        form.innerHTML = `
          <div class="success-message">
            <i class="fas fa-check-circle"></i>
            <h3>Message Sent Successfully!</h3>
            <p>Thank you for reaching out. I'll get back to you soon.</p>
          </div>
        `;
      }, 1500);
    }
  });
}

// Helper functions
function markInvalid(field, message) {
  field.style.borderColor = '#f50057';
  
  // Create or update error message
  let errorMessage = field.parentElement.querySelector('.error-message');
  if (!errorMessage) {
    errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    field.parentElement.appendChild(errorMessage);
  }
  errorMessage.textContent = message;
}

function markValid(field) {
  field.style.borderColor = '';
  const errorMessage = field.parentElement.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    document.querySelector(targetId).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Project hover effects
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.querySelector('.project-image').style.height = '220px';
  });
  
  card.addEventListener('mouseleave', () => {
    card.querySelector('.project-image').style.height = '200px';
  });
});

// Add a simple loading animation
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  
  // Update title to include your name
  document.title = "Rohan Kumar | Front-End Developer";
});

// Update copyright year automatically
document.addEventListener('DOMContentLoaded', () => {
  const footerYear = document.querySelector('.footer-content p');
  if (footerYear) {
    footerYear.innerHTML = `&copy; ${new Date().getFullYear()} Rohan Kumar. All Rights Reserved.`;
  }
});
