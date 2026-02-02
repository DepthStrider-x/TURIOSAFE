// ===== TRAVEL BOOKING UI INTERACTIONS & ANIMATIONS =====

// State management for animations
let isAnimating = false;

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
  setupSmoothScrolling();
  setupHoverEffects();
  setupLoadingAnimations();
});

function initializeAnimations() {
  // Animate travel navigation buttons on load
  const navButtons = document.querySelectorAll('.travel-nav-btn');
  
  navButtons.forEach((btn, index) => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      btn.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Animate main container
  const container = document.querySelector('.booking-form-container');
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(40px)';
    
    setTimeout(() => {
      container.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 500);
  }
}

function setupSmoothScrolling() {
  // Smooth scroll to booking section when nav buttons are clicked
  const travelSection = document.querySelector('.travel-booking');
  const navButtons = document.querySelectorAll('.travel-nav-btn');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (travelSection) {
        travelSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function setupHoverEffects() {
  // Enhanced hover effects for navigation buttons
  const navButtons = document.querySelectorAll('.travel-nav-btn');
  
  navButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        btn.style.transform = 'translateY(-8px) scale(1.05)';
        btn.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('active')) {
        btn.style.transform = 'translateY(0) scale(1)';
        btn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
      }
    });
  });
  
  // Hover effects for form inputs
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('input, select')) {
      e.target.style.transform = 'scale(1.02)';
      e.target.style.transition = 'all 0.3s ease';
    }
  });
  
  document.addEventListener('focusout', (e) => {
    if (e.target.matches('input, select')) {
      e.target.style.transform = 'scale(1)';
    }
  });
}

function setupLoadingAnimations() {
  // Intercept form submissions to show loading states
  document.addEventListener('submit', (e) => {
    if (e.target.matches('#flights-form, #trains-form, #buses-form, #cabs-form, #accommodations-form, #carbon-form')) {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      showButtonLoading(submitBtn);
    }
  });
}

// Smooth section transitions
function animateSectionTransition(fromSection, toSection) {
  if (isAnimating) return;
  isAnimating = true;
  
  const container = document.getElementById('dynamic-content');
  
  // Fade out current content
  container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  container.style.opacity = '0';
  container.style.transform = 'translateX(-20px)';
  
  setTimeout(() => {
    // Update content (this should be called from main.js)
    // Then fade in new content
    container.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateX(0)';
      isAnimating = false;
    }, 50);
  }, 300);
}

// Loading button animation
function showButtonLoading(button) {
  if (!button) return;
  
  const originalText = button.innerHTML;
  const originalWidth = button.offsetWidth;
  
  button.style.width = originalWidth + 'px';
  button.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <div class="loading-spinner" style="width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid white; margin: 0;"></div>
      <span>Processing...</span>
    </div>
  `;
  button.disabled = true;
  
  // Reset after 3 seconds (failsafe)
  setTimeout(() => {
    resetButton(button, originalText);
  }, 3000);
}

function resetButton(button, originalText) {
  if (!button) return;
  
  button.innerHTML = originalText;
  button.disabled = false;
  button.style.width = 'auto';
}

// Smooth dropdown animations
function animateDropdown(selectElement) {
  selectElement.addEventListener('focus', () => {
    selectElement.style.transform = 'scale(1.02)';
    selectElement.style.borderColor = '#007bff';
    selectElement.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
  });
  
  selectElement.addEventListener('blur', () => {
    selectElement.style.transform = 'scale(1)';
  });
}

// Form validation animations
function animateValidationError(input) {
  input.style.borderColor = '#dc3545';
  input.style.animation = 'shake 0.5s ease-in-out';
  
  setTimeout(() => {
    input.style.animation = '';
  }, 500);
}

function animateValidationSuccess(input) {
  input.style.borderColor = '#28a745';
  const checkmark = document.createElement('span');
  checkmark.innerHTML = '✓';
  checkmark.style.color = '#28a745';
  checkmark.style.marginLeft = '8px';
  checkmark.style.transition = 'all 0.3s ease';
  
  const parent = input.parentElement;
  parent.style.position = 'relative';
  checkmark.style.position = 'absolute';
  checkmark.style.right = '10px';
  checkmark.style.top = '70%';
  checkmark.style.transform = 'translateY(-50%)';
  
  parent.appendChild(checkmark);
  
  setTimeout(() => {
    checkmark.style.opacity = '0';
    setTimeout(() => {
      if (checkmark.parentElement) {
        checkmark.parentElement.removeChild(checkmark);
      }
    }, 300);
  }, 2000);
}

// Floating elements animation
function createFloatingElements() {
  const container = document.querySelector('.travel-booking');
  if (!container) return;
  
  for (let i = 0; i < 5; i++) {
    const element = document.createElement('div');
    element.innerHTML = ['✈️', '🚂', '🚌', '🚗', '🏨'][i];
    element.style.position = 'absolute';
    element.style.fontSize = '2rem';
    element.style.opacity = '0.1';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1';
    
    element.style.left = Math.random() * 100 + '%';
    element.style.top = Math.random() * 100 + '%';
    
    element.style.animation = `float ${5 + Math.random() * 5}s ease-in-out infinite ${Math.random() * 2}s`;
    
    container.style.position = 'relative';
    container.appendChild(element);
  }
}

// Particle effect for success animations
function createSuccessParticles(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.innerHTML = '✨';
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.fontSize = '1rem';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particle.style.transform = `translate(${x}px, ${y}px) scale(0)`;
      particle.style.opacity = '0';
      
      setTimeout(() => {
        if (particle.parentElement) {
          particle.parentElement.removeChild(particle);
        }
      }, 1000);
    }, 100);
  }
}

// Typewriter effect for text
function typeWriter(element, text, speed = 50) {
  element.innerHTML = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Add CSS animations dynamically
function addAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(5deg); }
      66% { transform: translateY(-10px) rotate(-5deg); }
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-slide-in {
      animation: slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .animate-pulse {
      animation: pulse 2s infinite;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize animations
addAnimationStyles();

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-slide-in');
    }
  });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll('.booking-form-container, .eco-tip, .partner-card');
  animateElements.forEach(el => observer.observe(el));
});

// Export functions for use in main.js
window.TravelAnimations = {
  animateSectionTransition,
  showButtonLoading,
  resetButton,
  animateValidationError,
  animateValidationSuccess,
  createSuccessParticles,
  typeWriter
};

// ===== ORIGINAL STATE SELECTOR FUNCTIONALITY =====
document.getElementById("stateSelect").addEventListener("change", function() {
  const state = this.value;

  if (state) {
    // Convert state name to lowercase and remove spaces for file naming
    const fileName = state.toLowerCase().replace(/\s+/g, "") + ".html";
    window.location.href = fileName;
  }
});