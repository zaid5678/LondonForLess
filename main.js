/* ============================================
   LONDON FOR LESS — main.js
   Vanilla JS interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── TICKER ──────────────────────────────────────────────────────
  function buildTicker() {
    const items = [
      '🎟 Free entry: Tate Modern — today only',
      '🍽 50% off at Dishoom with code LFL50',
      '🎉 Free pop-up: Covent Garden this Sat & Sun',
      '📍 New deal: Rooftop cinema £5 entry',
      '🆓 Free yoga: Hyde Park every Saturday 9am',
      '🎭 Free comedy night: Soho every Thursday',
      '🛍 Up to 40% off at Borough Market pop-up',
    ];
    const track = document.querySelector('.ticker-inner');
    if (!track) return;
    const content = items.map(i => `<span>${i}</span>`).join('<span>·</span>');
    track.innerHTML = content + '<span>·</span>' + content; // duplicate for seamless loop
  }

  // ── CALENDAR ────────────────────────────────────────────────────
  function buildCalendar() {
    const container = document.getElementById('events-calendar');
    if (!container) return;

    const events = {
      1: [{ text: 'Free entry: National Gallery', type: 'free' }],
      2: [{ text: 'Bottomless Brunch £25pp — Shoreditch', type: 'food' }],
      3: [{ text: 'Street Food Market — King\'s Cross', type: 'food' }],
      4: [{ text: 'Free Comedy Night — Soho', type: 'free' }],
      5: [{ text: 'Pop-Up Bar — Rooftop Southbank', type: 'popup' }, { text: 'Free Museum Late — V&A', type: 'free' }],
      6: [{ text: 'Borough Market', type: 'food' }, { text: 'Free Yoga — Hyde Park', type: 'free' }],
      0: [{ text: 'Portobello Road Market', type: 'food' }, { text: 'Free Art Fair — East London', type: 'free' }],
    };

    const today = new Date();
    const todayDay = today.getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // caption
    const caption = document.getElementById('calendar-caption');
    if (caption) {
      caption.textContent = `Today is ${fullDayNames[todayDay]} ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;
    }

    // find Monday of current week
    const monday = new Date(today);
    const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
    monday.setDate(today.getDate() + diff);

    container.innerHTML = '';
    let todayColumn = null;

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayIndex = day.getDay();
      const isToday = day.toDateString() === today.toDateString();
      const isWeekend = dayIndex === 0 || dayIndex === 6;

      const col = document.createElement('div');
      col.className = 'cal-day' + (isToday ? ' today' : '') + (isWeekend ? ' weekend' : '');

      const dayName = document.createElement('div');
      dayName.className = 'cal-day-name';
      dayName.textContent = dayNames[dayIndex];

      const dateNum = document.createElement('div');
      dateNum.className = 'cal-day-date';
      dateNum.textContent = day.getDate();

      col.appendChild(dayName);
      col.appendChild(dateNum);

      const dayEvents = events[dayIndex] || [];
      dayEvents.forEach(ev => {
        const pill = document.createElement('span');
        pill.className = `cal-event ${ev.type}`;
        pill.textContent = ev.text;
        col.appendChild(pill);
      });

      container.appendChild(col);
      if (isToday) todayColumn = col;
    }

    // scroll today into view on mobile
    if (todayColumn) {
      setTimeout(() => {
        todayColumn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 300);
    }
  }

  // ── MAP ─────────────────────────────────────────────────────────
  function initMap() {
    const mapEl = document.getElementById('deals-map');
    if (!mapEl || typeof L === 'undefined') return;

    const map = L.map('deals-map', { scrollWheelZoom: false }).setView([51.5074, -0.1278], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const categoryColours = {
      'Freebies': '#4BA3C3',
      'Food': '#C0533A',
      'Pop-Up': '#0D2233',
      'Entertainment': '#6B8A9A',
      'Things To Do': '#4BA3C3',
    };

    const pins = [
      { lat: 51.5081, lng: -0.0759, title: 'Free Street Food Market', category: 'Food', location: 'Borough Market, SE1', desc: '50+ street food stalls. Free entry, all weekend.' },
      { lat: 51.5076, lng: -0.1237, title: 'Free Comedy Night', category: 'Entertainment', location: 'Soho, W1', desc: 'Free stand-up every Thursday from 7pm.' },
      { lat: 51.5074, lng: -0.1215, title: 'Rooftop Pop-Up Bar', category: 'Pop-Up', location: 'Southbank, SE1', desc: '£5 entry, free if you arrive before 6pm.' },
      { lat: 51.5194, lng: -0.1270, title: 'Free Museum Late', category: 'Freebies', location: 'British Museum, WC1', desc: 'Free evening entry every Friday until 8:30pm.' },
      { lat: 51.5007, lng: -0.1246, title: 'Free Walking Tour', category: 'Things To Do', location: 'Westminster, SW1', desc: 'Daily free guided tour, tip-based. 10am & 2pm.' },
      { lat: 51.5155, lng: -0.0922, title: 'Pop-Up Market', category: 'Pop-Up', location: 'Brick Lane, E1', desc: 'Weekend vintage & street food pop-up. Free entry.' },
    ];

    const markers = [];

    pins.forEach(pin => {
      const colour = categoryColours[pin.category] || '#4BA3C3';
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-marker" style="background:${colour};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon })
        .bindPopup(`
          <div style="font-family:'DM Sans',sans-serif;min-width:180px;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#4BA3C3;margin-bottom:4px;">${pin.category}</div>
            <div style="font-size:14px;font-weight:600;color:#0D2233;margin-bottom:2px;">${pin.title}</div>
            <div style="font-size:11px;color:#6B8A9A;margin-bottom:6px;">${pin.location}</div>
            <div style="font-size:12px;color:#1A2E3B;margin-bottom:8px;">${pin.desc}</div>
            <a href="deals.html" style="font-size:11px;font-weight:600;color:#4BA3C3;text-decoration:none;">View Deal →</a>
          </div>
        `)
        .addTo(map);

      marker._category = pin.category;
      markers.push(marker);
    });

    // update counter
    function updateCounter(visible) {
      const counter = document.getElementById('map-counter');
      if (counter) counter.textContent = `Showing ${visible} deals near Central London`;
    }
    updateCounter(pins.length);

    // expose for category filter
    window._mapMarkers = markers;
    window._map = map;
    window._updateMapCounter = updateCounter;
  }

  // ── CATEGORY FILTER ─────────────────────────────────────────────
  function initCategoryFilter() {
    const tabs = document.querySelectorAll('.cat-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        filterByCategory(cat);
      });
    });
  }

  function filterByCategory(cat) {
    // Filter cards
    const cards = document.querySelectorAll('[data-category]');
    let visible = 0;
    cards.forEach(card => {
      const match = cat === 'all' || card.dataset.category === cat;
      if (match) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    // Filter map markers
    if (window._mapMarkers && window._map) {
      let mapVisible = 0;
      window._mapMarkers.forEach(marker => {
        const match = cat === 'all' || marker._category.toLowerCase() === cat.toLowerCase();
        if (match) {
          marker.addTo(window._map);
          mapVisible++;
        } else {
          marker.remove();
        }
      });
      if (window._updateMapCounter) window._updateMapCounter(cat === 'all' ? window._mapMarkers.length : mapVisible);
    }
  }

  // ── NAV ─────────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  const ticker = document.querySelector('.ticker-bar');
  const tickerH = ticker ? ticker.offsetHeight : 0;

  if (nav) {
    const onScroll = () => {
      if (window.scrollY > tickerH + 10) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // hamburger
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay = document.querySelector('.nav-mobile-overlay');
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      overlay.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        overlay.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ── ACTIVE NAV LINK ─────────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile-overlay a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── BACK TO TOP ─────────────────────────────────────────────────
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── INTERSECTION OBSERVER (fade-up + stagger) ───────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up, .stagger').forEach(el => io.observe(el));

  // ── HERO PARALLAX ───────────────────────────────────────────────
  const heroSkyline = document.querySelector('.hero-skyline');
  if (heroSkyline) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroSkyline.style.transform = `translateY(${y * 0.25}px)`;
    }, { passive: true });
  }

  // ── FILTER TABS (deals.html legacy filter bar) ──────────────────
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

  // ── HORIZONTAL SCROLL DRAG ──────────────────────────────────────
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

  // ── NEWSLETTER FORM ─────────────────────────────────────────────
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

  // ── CONTACT FORM ────────────────────────────────────────────────
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

  // ── INIT ────────────────────────────────────────────────────────
  buildTicker();
  buildCalendar();
  initCategoryFilter();

  // Map init (only if Leaflet loaded)
  if (typeof L !== 'undefined') {
    initMap();
  } else {
    const mapEl = document.getElementById('deals-map');
    if (mapEl) {
      window.addEventListener('load', initMap);
    }
  }

});
