// Refrigeração & Climatização Visual - Interactive Functionality

document.addEventListener('DOMContentLoaded', () => {
  // 1. Data Dinâmica em Português na Barra de Aviso Superior
  const dateEl = document.getElementById('current-full-date');
  if (dateEl) {
    const today = new Date();
    const months = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const day = String(today.getDate()).padStart(2, '0');
    const month = months[today.getMonth()];
    dateEl.textContent = `${day} DE ${month}`;
  }

  // 2. Acordeão dos Módulos ("Ver o que está incluso")
  const moduleBtns = document.querySelectorAll('.module-accordion-btn');
  moduleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentCard = btn.closest('.module-card');
      if (!parentCard) return;
      const wrap = parentCard.querySelector('.module-desc-wrap');
      const icon = btn.querySelector('.module-accordion-icon');

      if (wrap) {
        const isOpen = wrap.classList.contains('is-open');
        if (isOpen) {
          wrap.classList.remove('is-open');
          if (icon) icon.textContent = '+';
        } else {
          wrap.classList.add('is-open');
          if (icon) icon.textContent = '−';
        }
      }
    });
  });

  // 3. Acordeão da Seção de FAQ (Perguntas Frequentes)
  const faqBtns = document.querySelectorAll('.faq-question-btn');
  faqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;

      const isCurrentOpen = item.classList.contains('is-open');

      // Fecha outros itens para comportamento accordion limpo (opcional, ou toggle independente)
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
        }
      });

      if (isCurrentOpen) {
        item.classList.remove('is-open');
      } else {
        item.classList.add('is-open');
      }
    });
  });

  // 4. Modal Lightbox para visualização dos prints de depoimentos
  const modal = document.getElementById('preview-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const closeBtn = document.getElementById('modal-close-btn');

  function openPreview(imgSrc, titleText) {
    if (!modal || !modalImg) return;
    modalImg.src = imgSrc;
    if (modalTitle) {
      modalTitle.textContent = titleText || 'Depoimento de Aluno';
    }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePreview() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Cards de depoimentos com data-full
  const clickableCards = document.querySelectorAll('[data-full]');
  clickableCards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-full');
      const title = card.getAttribute('data-title');
      if (src) {
        openPreview(src, title);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closePreview);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePreview();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closePreview();
    }
  });

  // 5. Rolagem Suave para âncoras (ex: #oferta)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // 6. Pop-up Downsell / Oferta Completa com Desconto (ao clicar no Plano Simples)
  const btnOpenDownsell = document.getElementById('btn-open-downsell');
  const downsellModal = document.getElementById('downsell-modal');
  const downsellCloseBtn = document.getElementById('downsell-close-btn');
  const downsellDeclineBtn = document.getElementById('downsell-decline-btn');
  const downsellAcceptBtn = document.getElementById('downsell-accept-btn');

  function openDownsell(e) {
    if (e) e.preventDefault();
    if (!downsellModal) return;
    downsellModal.classList.add('active');
    downsellModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDownsell() {
    if (!downsellModal) return;
    downsellModal.classList.remove('active');
    downsellModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnOpenDownsell) {
    btnOpenDownsell.addEventListener('click', openDownsell);
  }

  if (downsellCloseBtn) {
    downsellCloseBtn.addEventListener('click', closeDownsell);
  }

  if (downsellDeclineBtn) {
    downsellDeclineBtn.addEventListener('click', () => {
      closeDownsell();
    });
  }

  if (downsellAcceptBtn) {
    downsellAcceptBtn.addEventListener('click', () => {
      closeDownsell();
    });
  }

  if (downsellModal) {
    downsellModal.addEventListener('click', (e) => {
      if (e.target === downsellModal) {
        closeDownsell();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && downsellModal && downsellModal.classList.contains('active')) {
      closeDownsell();
    }
  });

  // 7. Barra Flutuante Mobile (Sticky Bar) com ativação suave no scroll
  const stickyBar = document.getElementById('mobile-sticky-bar');
  const ofertaSection = document.getElementById('oferta');

  if (stickyBar) {
    let ticking = false;
    const handleStickyScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      let inOfferRange = false;

      if (ofertaSection) {
        const rect = ofertaSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= 50) {
          inOfferRange = true;
        }
      }

      if (window.innerWidth <= 768 && scrollY > 320 && !inOfferRange) {
        stickyBar.classList.add('is-visible');
      } else {
        stickyBar.classList.remove('is-visible');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleStickyScroll);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleStickyScroll);
        ticking = true;
      }
    }, { passive: true });
  }
});
