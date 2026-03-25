/* ============================================
   LONDON FOR LESS — main.js
   Vanilla JS interactions
   ============================================ */

(function () {
  'use strict';

  /* ── Nav: transparent → solid on scroll ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile hamburger ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileOverlay = document.querySelector('.nav-mobile-overlay');
  if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileOverlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileOverlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileOverlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile-overlay a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Back to top button ── */
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── IntersectionObserver: fade-up elements ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up, .stagger').forEach(el => io.observe(el));

  /* ── Hero subtle parallax ── */
  const heroSkyline = document.querySelector('.hero-skyline');
  if (heroSkyline) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroSkyline.style.transform = `translateY(${y * 0.25}px)`;
    }, { passive: true });
  }

  /* ── Filter tabs (deals.html) ── */
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    const btns = filterBar.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.deal-card');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? '' : 'none';
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          if (show) {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'none';
            });
          }
        });
      });
    });
  }

  /* ── Horizontal scroll drag ── */
  document.querySelectorAll('.scroll-strip').forEach(strip => {
    let isDown = false, startX, scrollLeft;
    strip.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });
    strip.addEventListener('mouseleave', () => isDown = false);
    strip.addEventListener('mouseup', () => isDown = false);
    strip.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      strip.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  });

  /* ── Newsletter form ── */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.newsletter-submit');
      const input = form.querySelector('.newsletter-input');
      if (!input.value.trim()) return;
      btn.textContent = 'You\'re in!';
      btn.style.background = '#5bd98a';
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
      }, 3500);
    });
  });

  /* ── Contact form ── */
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Message Sent!';
      btn.style.background = '#5bd98a';
      btn.style.color = '#0D2233';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.style.color = '';
        contactForm.reset();
      }, 4000);
    });
  }

})();
