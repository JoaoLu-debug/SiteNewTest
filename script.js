/* ==========================================================================
   SYNAPSE LAB // INTERACTIVE & MOTION LOGIC (ULTRA-LIGHTWEIGHT 60FPS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. HIGH-PERFORMANCE CUSTOM CURSOR WITH AUTO-SLEEP
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;
  
  let isCursorAnimating = false;

  // Optimized Lerp loop that stops running when the mouse is stationary
  function animateCursor() {
    const lerpOuter = 0.15;
    const lerpInner = 0.35;

    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    const dDotX = mouseX - dotX;
    const dDotY = mouseY - dotY;

    // Check if the cursor has settled. If yes, stop the loop to save CPU!
    if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && Math.abs(dDotX) < 0.05 && Math.abs(dDotY) < 0.05) {
      isCursorAnimating = false;
      return; 
    }

    cursorX += dx * lerpOuter;
    cursorY += dy * lerpOuter;
    dotX += dDotX * lerpInner;
    dotY += dDotY * lerpInner;

    // GPU-accelerated transformations
    cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0)`;
    cursorDot.style.transform = `translate3d(calc(${dotX}px - 50%), calc(${dotY}px - 50%), 0)`;

    requestAnimationFrame(animateCursor);
  }

  // Mousemove listener: updates targets and wakes up loop if sleeping
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isCursorAnimating) {
      isCursorAnimating = true;
      requestAnimationFrame(animateCursor);
    }
  });

  // Hover States
  const hoverTargets = document.querySelectorAll('.hover-target');
  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      cursorDot.classList.add('hovering');
    });
    
    target.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
      cursorDot.classList.remove('hovering');
    });
  });

  // Action Button Zoom effect
  const zoomAction = document.getElementById('zoom-action');
  if (zoomAction) {
    zoomAction.addEventListener('mouseenter', () => {
      cursor.classList.add('zoom-active');
    });
    zoomAction.addEventListener('mouseleave', () => {
      cursor.classList.remove('zoom-active');
    });
    
    zoomAction.addEventListener('click', () => {
      document.body.classList.toggle('interface-expanded');
      zoomAction.style.transform = 'scale(0.9)';
      setTimeout(() => {
        zoomAction.style.transform = '';
      }, 150);
    });
  }


  // 2. BACKGROUND BLOBS MOUSE PARALLAX WITH AUTO-SLEEP
  const blobs = document.querySelectorAll('.warp-blob');
  let blobTargetX = 0;
  let blobTargetY = 0;
  let blobCurrentX = 0;
  let blobCurrentY = 0;
  
  let isBlobsAnimating = false;

  document.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    
    blobTargetX = normX * 60;
    blobTargetY = normY * 60;

    if (!isBlobsAnimating) {
      isBlobsAnimating = true;
      requestAnimationFrame(animateBlobs);
    }
  });

  function animateBlobs() {
    const dx = blobTargetX - blobCurrentX;
    const dy = blobTargetY - blobCurrentY;

    if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
      isBlobsAnimating = false;
      return;
    }

    blobCurrentX += dx * 0.04;
    blobCurrentY += dy * 0.04;

    blobs.forEach((blob, index) => {
      const factor = (index + 1) * 0.45;
      blob.style.transform = `translate3d(${blobCurrentX * factor}px, ${blobCurrentY * factor}px, 0)`;
    });

    requestAnimationFrame(animateBlobs);
  }


  // 3. PIXEL-PERFECT GRADUAL SCROLL-DRIVEN DARK MODE
  let scrollTick = false;
  
  document.addEventListener('scroll', () => {
    if (!scrollTick) {
      window.requestAnimationFrame(() => {
        const startScroll = 0;
        const endScroll = window.innerHeight * 1.2;
        const scrollY = window.scrollY;
        
        const progress = Math.min(Math.max((scrollY - startScroll) / (endScroll - startScroll), 0), 1);
        
        document.documentElement.style.setProperty('--dark-progress', progress);
        
        if (progress > 0.5) {
          if (!document.body.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
          }
        } else {
          if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
          }
        }
        scrollTick = false;
      });
      scrollTick = true;
    }
  });


  // 4. DYNAMIC GMT/UTC AND SWISS TIME CLOCKS
  const timeDisplay = document.querySelector('.time-display');
  const footerClock = document.querySelector('.footer-clock');

  function updateClocks() {
    const now = new Date();
    
    // São Paulo Local Time (UTC-3)
    const optionsLocal = {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const optionsDate = {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    const timeStringLocal = new Intl.DateTimeFormat('pt-BR', optionsLocal).format(now);
    const dateStringLocal = new Intl.DateTimeFormat('pt-BR', optionsDate).format(now);
    if (timeDisplay) {
      timeDisplay.textContent = `${timeStringLocal} UTC-3 / ${dateStringLocal}`;
    }

    // Zürich Time (Europe/Zurich)
    const optionsZurich = {
      timeZone: 'Europe/Zurich',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
      hour12: false
    };
    const timeStringZurich = new Intl.DateTimeFormat('en-US', optionsZurich).format(now);
    if (footerClock) {
      footerClock.textContent = timeStringZurich;
    }
  }
  
  setInterval(updateClocks, 1000);
  updateClocks();


  // 5. STATIC FRAME RATE VALUE (PRESERVES CPU CYCLES)
  const fpsValue = document.querySelector('.fps-value');
  if (fpsValue) {
    fpsValue.textContent = '60 FPS';
    fpsValue.style.color = '#34d399'; // green tint indicating stable high-perf
  }


  // 6. PROCESS TIMELINE INTERACTIVITY
  const processSteps = document.querySelectorAll('.process-step');
  const progressLine = document.querySelector('.timeline-progress');
  
  if (processSteps.length > 0 && progressLine) {
    processSteps.forEach((step, index) => {
      step.addEventListener('mouseenter', () => {
        activateStep(index);
      });
      
      step.addEventListener('click', () => {
        activateStep(index);
      });
    });

    function activateStep(index) {
      processSteps.forEach((s, idx) => {
        if (idx <= index) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
      
      const percent = (index / (processSteps.length - 1)) * 100;
      progressLine.style.width = `${percent}%`;
    }
  }


  // 7. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  const revealElements = [
    document.querySelector('.manifesto-text'),
    document.querySelector('.services-grid'),
    document.querySelector('.process-timeline-container'),
    document.querySelector('.works-grid'),
    document.querySelector('.testimonial-wrapper'),
    document.querySelector('.cta-title'),
    document.querySelector('.footer-grid')
  ];

  const observerOptions = {
    root: null,
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    if (el) {
      el.classList.add('reveal-init');
      observer.observe(el);
    }
  });


  // 8. 3D TILT EFFECT ON HERO TITLE WITH AUTO-SLEEP
  const heroCenter = document.querySelector('.hero-center');
  const heroTitle = document.querySelector('.hero-title');
  
  let tiltX = 0;
  let tiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  
  let isTiltAnimating = false;
  
  if (heroCenter && heroTitle) {
    heroCenter.addEventListener('mousemove', (e) => {
      const rect = heroCenter.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      const mouseXRel = (e.clientX - rect.left - width / 2) / (width / 2);
      const mouseYRel = (e.clientY - rect.top - height / 2) / (height / 2);
      
      const maxTilt = 12;
      tiltY = mouseXRel * maxTilt;
      tiltX = -mouseYRel * maxTilt;

      if (!isTiltAnimating) {
        isTiltAnimating = true;
        requestAnimationFrame(updateTilt);
      }
    });
    
    heroCenter.addEventListener('mouseleave', () => {
      tiltX = 0;
      tiltY = 0;
    });
    
    function updateTilt() {
      const lerpFactor = 0.08;
      
      const dx = tiltX - currentTiltX;
      const dy = tiltY - currentTiltY;

      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
        currentTiltX = tiltX;
        currentTiltY = tiltY;
        heroTitle.style.transform = `perspective(1000px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
        isTiltAnimating = false;
        return;
      }

      currentTiltX += dx * lerpFactor;
      currentTiltY += dy * lerpFactor;
      
      heroTitle.style.transform = `perspective(1000px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
      
      requestAnimationFrame(updateTilt);
    }
  }


  // 9. SERVICE CARDS TILT WITH SIBLING DIMMING & AUTO-SLEEP
  const serviceCards = document.querySelectorAll('.service-card');
  let isCardsTiltAnimating = false;
  
  serviceCards.forEach(card => {
    card.tiltX = 0;
    card.tiltY = 0;
    card.currentTiltX = 0;
    card.currentTiltY = 0;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      const relX = (e.clientX - rect.left) / width;
      const relY = (e.clientY - rect.top) / height;
      
      card.style.setProperty('--mouse-x', `${relX * 100}%`);
      card.style.setProperty('--mouse-y', `${relY * 100}%`);
      
      const maxTilt = 9;
      card.tiltY = (relX - 0.5) * maxTilt * 2;
      card.tiltX = -(relY - 0.5) * maxTilt * 2;

      if (!isCardsTiltAnimating) {
        isCardsTiltAnimating = true;
        requestAnimationFrame(updateCardTilts);
      }
    });
    
    card.addEventListener('mouseenter', () => {
      serviceCards.forEach(otherCard => {
        if (otherCard !== card) {
          otherCard.classList.add('dimmed');
        }
      });
    });
    
    card.addEventListener('mouseleave', () => {
      card.tiltX = 0;
      card.tiltY = 0;
      
      serviceCards.forEach(otherCard => {
        otherCard.classList.remove('dimmed');
      });
    });
  });
  
  function updateCardTilts() {
    const lerpFactor = 0.12;
    let anyActive = false;
    
    serviceCards.forEach(card => {
      const dx = card.tiltX - card.currentTiltX;
      const dy = card.tiltY - card.currentTiltY;
      
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        card.currentTiltX += dx * lerpFactor;
        card.currentTiltY += dy * lerpFactor;
        card.style.transform = `perspective(900px) rotateX(${card.currentTiltX}deg) rotateY(${card.currentTiltY}deg)`;
        anyActive = true;
      } else {
        card.currentTiltX = card.tiltX;
        card.currentTiltY = card.tiltY;
        if (card.currentTiltX === 0 && card.currentTiltY === 0) {
          card.style.transform = '';
        } else {
          card.style.transform = `perspective(900px) rotateX(${card.currentTiltX}deg) rotateY(${card.currentTiltY}deg)`;
          anyActive = true;
        }
      }
    });
    
    if (anyActive) {
      requestAnimationFrame(updateCardTilts);
    } else {
      isCardsTiltAnimating = false;
    }
  }

});

// Append dynamically loaded reveal styles
const styleReveal = document.createElement('style');
styleReveal.textContent = `
  .reveal-init {
    opacity: 0;
    transform: translate3d(0, 25px, 0);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }
  .reveal-init.revealed {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  
  body.interface-expanded {
    --grid-margin: 1.5vw;
  }
  body.interface-expanded .custom-cursor {
    border-color: var(--color-accent);
  }
`;
document.head.appendChild(styleReveal);
