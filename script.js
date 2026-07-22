/* ==========================================================================
   SYNAPSE LAB // INTERACTIVE & MOTION LOGIC (OPTIMIZED FOR 60FPS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. CONTROLADOR DE CURSOR PERSONALIZADO (INTERPOLADO / MORPHING)
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Loop de atualização do cursor com interpolação suave (Lerp)
  function animateCursor() {
    const lerpOuter = 0.15; // Suavidade da circunferência externa
    const lerpInner = 0.35; // Suavidade do ponto interno

    cursorX += (mouseX - cursorX) * lerpOuter;
    cursorY += (mouseY - cursorY) * lerpOuter;
    dotX += (mouseX - dotX) * lerpInner;
    dotY += (mouseY - dotY) * lerpInner;

    // Transforma usando translate3d para aceleração de hardware (GPU)
    cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0)`;
    cursorDot.style.transform = `translate3d(calc(${dotX}px - 50%), calc(${dotY}px - 50%), 0)`;

    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  // Hover States no cursor
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

  // Efeito especial de Zoom no botão circular de ação do Hero
  const zoomAction = document.getElementById('zoom-action');
  if (zoomAction) {
    zoomAction.addEventListener('mouseenter', () => {
      cursor.classList.add('zoom-active');
    });
    zoomAction.addEventListener('mouseleave', () => {
      cursor.classList.remove('zoom-active');
    });
    
    // Zoom/Expand Action
    zoomAction.addEventListener('click', () => {
      document.body.classList.toggle('interface-expanded');
      zoomAction.style.transform = 'scale(0.9)';
      setTimeout(() => {
        zoomAction.style.transform = 'none';
      }, 150);
    });
  }


  // 2. PARALLAX COM MOUSE NOS WARP BLOBS DE FUNDO (OTIMIZADO)
  const blobs = document.querySelectorAll('.warp-blob');
  let blobTargetX = 0;
  let blobTargetY = 0;
  let blobCurrentX = 0;
  let blobCurrentY = 0;

  document.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    
    blobTargetX = normX * 60; // Deslocamento sutil para suavidade
    blobTargetY = normY * 60;
  });

  function animateBlobs() {
    blobCurrentX += (blobTargetX - blobCurrentX) * 0.04;
    blobCurrentY += (blobTargetY - blobCurrentY) * 0.04;

    blobs.forEach((blob, index) => {
      const factor = (index + 1) * 0.45;
      blob.style.transform = `translate3d(${blobCurrentX * factor}px, ${blobCurrentY * factor}px, 0)`;
    });

    requestAnimationFrame(animateBlobs);
  }
  requestAnimationFrame(animateBlobs);


  // 3. TRANSIÇÃO DE MODO ESCURO BASEADA NO SCROLL (PIXEL-PERFECT E GRADUAL)
  let scrollTick = false;
  
  document.addEventListener('scroll', () => {
    if (!scrollTick) {
      window.requestAnimationFrame(() => {
        const startScroll = 0;
        // Transição lenta que termina quando o usuário rolar 1.2x a altura da tela
        const endScroll = window.innerHeight * 1.2;
        const scrollY = window.scrollY;
        
        // Calcula a porcentagem de progresso de 0 a 1
        const progress = Math.min(Math.max((scrollY - startScroll) / (endScroll - startScroll), 0), 1);
        
        // Define a variável customizada no elemento raiz (HTML) para controle no CSS
        document.documentElement.style.setProperty('--dark-progress', progress);
        
        // Mantém a classe dark-mode para mudanças estruturais binárias a partir de 50% do progresso
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


  // 4. HORA LOCAL DINÂMICA (UTC-3 & ZÜRICH)
  const timeDisplay = document.querySelector('.time-display');
  const footerClock = document.querySelector('.footer-clock');

  function updateClocks() {
    const now = new Date();
    
    // Hora local (São Paulo / UTC-3)
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

    // Hora de Zürich (Suíça)
    const optionsZurich = {
      timeZone: 'Europe/Zurich',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
      hour12: false
    };
    const timeStringZurich = new Intl.DateTimeFormat('pt-BR', optionsZurich).format(now);
    if (footerClock) {
      footerClock.textContent = timeStringZurich;
    }
  }
  
  setInterval(updateClocks, 1000);
  updateClocks();


  // 5. MONITOR DE TAXA DE QUADROS (FPS COUNTER)
  const fpsValue = document.querySelector('.fps-value');
  let lastFrameTime = performance.now();
  let frames = 0;
  
  function monitorFPS() {
    const now = performance.now();
    frames++;
    
    if (now >= lastFrameTime + 1000) {
      const currentFPS = Math.round((frames * 1000) / (now - lastFrameTime));
      if (fpsValue) {
        fpsValue.textContent = `${currentFPS} FPS`;
        if (currentFPS < 52) {
          fpsValue.style.color = 'var(--color-accent)';
        } else {
          fpsValue.style.color = '';
        }
      }
      frames = 0;
      lastFrameTime = now;
    }
    
    requestAnimationFrame(monitorFPS);
  }
  requestAnimationFrame(monitorFPS);


  // 6. INTERATIVIDADE NA TIMELINE DO PROCESSO
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


  // 7. ANIMAÇÃO DE ENTRADA AO SCROLLAR (REVEAL ANIMATIONS ON SCROLL)
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

  // 8. EFEITO TILT 3D NO TÍTULO HERO (INSPIRADO EM FLUTTER TILT / VANILLA TILT)
  const heroCenter = document.querySelector('.hero-center');
  const heroTitle = document.querySelector('.hero-title');
  
  let tiltX = 0;
  let tiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  
  if (heroCenter && heroTitle) {
    heroCenter.addEventListener('mousemove', (e) => {
      const rect = heroCenter.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Coordenadas normalizadas em relação ao centro (-1 a 1)
      const mouseXRel = (e.clientX - rect.left - width / 2) / (width / 2);
      const mouseYRel = (e.clientY - rect.top - height / 2) / (height / 2);
      
      // Rotação máxima de 12 graus
      const maxTilt = 12;
      tiltY = mouseXRel * maxTilt;  // Rotação no eixo Y (Yaw)
      tiltX = -mouseYRel * maxTilt; // Rotação no eixo X (Pitch)
    });
    
    heroCenter.addEventListener('mouseleave', () => {
      tiltX = 0;
      tiltY = 0;
    });
    
    // Loop de renderização suavizado (Lerp) para Spring/Easing Effect no Tilt
    function updateTilt() {
      const lerpFactor = 0.08; // Suavidade da desaceleração
      
      currentTiltX += (tiltX - currentTiltX) * lerpFactor;
      currentTiltY += (tiltY - currentTiltY) * lerpFactor;
      
      // Aplica a rotação 3D ao título
      heroTitle.style.transform = `perspective(1000px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
      
      requestAnimationFrame(updateTilt);
    }
    requestAnimationFrame(updateTilt);
  }

});

// Adiciona estilos dinâmicos de reveal e expansão diretamente no documento
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
