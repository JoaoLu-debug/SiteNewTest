/* ==========================================================================
   SYNAPSE LAB // INTERACTIVE & MOTION LOGIC
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
    const lerpInner = 0.35; // Suavidade do ponto interno (mais rápido)

    cursorX += (mouseX - cursorX) * lerpOuter;
    cursorY += (mouseY - cursorY) * lerpOuter;
    dotX += (mouseX - dotX) * lerpInner;
    dotY += (mouseY - dotY) * lerpInner;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

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
      // Adiciona animação de pulso temporário
      zoomAction.style.transform = 'scale(0.9)';
      setTimeout(() => {
        zoomAction.style.transform = 'none';
      }, 150);
    });
  }


  // 2. PARALLAX COM MOUSE NOS WARP BLOBS DE FUNDO
  const blobs = document.querySelectorAll('.warp-blob');
  let blobTargetX = 0;
  let blobTargetY = 0;
  let blobCurrentX = 0;
  let blobCurrentY = 0;

  document.addEventListener('mousemove', (e) => {
    // Calcula o deslocamento do mouse em relação ao centro da tela (-0.5 a 0.5)
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    
    // Sensibilidade do deslocamento dos blobs
    blobTargetX = normX * 80;
    blobTargetY = normY * 80;
  });

  function animateBlobs() {
    // Interpolação muito suave para sensação flutuante
    blobCurrentX += (blobTargetX - blobCurrentX) * 0.04;
    blobCurrentY += (blobTargetY - blobCurrentY) * 0.04;

    blobs.forEach((blob, index) => {
      // Cada blob se move em uma velocidade (profundidade) diferente
      const factor = (index + 1) * 0.55;
      blob.style.transform = `translate3d(${blobCurrentX * factor}px, ${blobCurrentY * factor}px, 0)`;
    });

    requestAnimationFrame(animateBlobs);
  }
  requestAnimationFrame(animateBlobs);


  // 3. HORA LOCAL DINÂMICA (UTC-3 & ZÜRICH)
  const timeDisplay = document.querySelector('.time-display');
  const footerClock = document.querySelector('.footer-clock');

  function updateClocks() {
    const now = new Date();
    
    // 1. Hora UTC-3 (Estúdio/Freelancer local)
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

    // 2. Hora de Zürich (Fuso Suíço)
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
  updateClocks(); // Execução inicial


  // 4. MONITOR DE TAXA DE QUADROS (FPS COUNTER)
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
        // Ajusta a cor caso haja quedas significativas
        if (currentFPS < 50) {
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


  // 5. INTERATIVIDADE NA TIMELINE DO PROCESSO
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
      
      // Atualiza a largura da barra de progresso (em porcentagem)
      const percent = (index / (processSteps.length - 1)) * 100;
      progressLine.style.width = `${percent}%`;
    }
  }


  // 6. ANIMAÇÃO DE ENTRADA AO SCROLLAR (REVEAL ANIMATIONS ON SCROLL)
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
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Deixa de observar uma vez revelado
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    if (el) {
      // Adiciona estilo de preparação de reveal
      el.classList.add('reveal-init');
      observer.observe(el);
    }
  });

});

// Adiciona estilos dinâmicos de reveal diretamente no documento para manter style.css focado
const styleReveal = document.createElement('style');
styleReveal.textContent = `
  .reveal-init {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal-init.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Expansão da interface ao clicar no botão de Zoom */
  body.interface-expanded {
    --grid-margin: 1.5vw;
  }
  body.interface-expanded .custom-cursor {
    border-color: var(--color-accent);
  }
`;
document.head.appendChild(styleReveal);
