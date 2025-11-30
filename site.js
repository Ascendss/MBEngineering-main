// Site-wide theme and settings loader
document.addEventListener('DOMContentLoaded', async () => {
  const header = document.querySelector('header');
  const homeLink = document.querySelector('.home-link');
  
  // ===== Scroll shadow effect =====
  if (header) {
    const updateHeaderShadow = () => {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  }

  // ===== Highlight active nav link =====
  const navLinks = document.querySelectorAll('nav a');
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Match current page or index
    if (href === currentPage || 
        (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  // ===== Load site settings from JSON =====
  try {
    const res = await fetch('/content/site.json');
    if (!res.ok) throw new Error('Failed to load site settings');
    const data = await res.json();

    const root = document.documentElement;

    // Apply theme colors
    if (data.headerBg) root.style.setProperty('--site-header-bg', data.headerBg);
    if (data.headerText) root.style.setProperty('--site-header-text', data.headerText);
    if (data.pageBg) root.style.setProperty('--site-page-bg', data.pageBg);
    if (data.cardBg) root.style.setProperty('--site-card-bg', data.cardBg);

    // Apply animated background GIF
    if (data.backgroundGifEnabled && data.backgroundGifUrl) {
      root.style.setProperty('--page-bg-gif', `url('${data.backgroundGifUrl}')`);
      document.body.classList.remove('no-bg-gif');
    } else {
      root.style.setProperty('--page-bg-gif', 'none');
      document.body.classList.add('no-bg-gif');
    }

    // Apply GIF opacity and blur from settings
    const opacity = (typeof data.backgroundGifOpacity === 'number')
      ? data.backgroundGifOpacity
      : 0.12;
    const blur = (typeof data.backgroundGifBlur === 'number')
      ? data.backgroundGifBlur
      : 7;

    root.style.setProperty('--page-bg-gif-opacity', String(opacity));
    root.style.setProperty('--page-bg-gif-blur', `${blur}px`);

    // Update site title and subtitle
    const siteTitleEl = document.querySelector('.site-title');
    const siteSubtitleEl = document.querySelector('.site-subtitle');

    if (siteTitleEl) {
      const title = data.siteTitle || 'MB Engineering';
      // If title contains a pipe, create structured markup for animation support
      if (title.includes('|')) {
        const parts = title.split('|');
        const name = parts[0].trim();
        const role = parts.slice(1).join('|').trim();
        siteTitleEl.innerHTML = `${name} <span class="site-title-separator">|</span> <span id="site-role-text">${role}</span><span class="site-title-cursor">|</span>`;
      } else {
        siteTitleEl.textContent = title;
      }
    }
    if (siteSubtitleEl) siteSubtitleEl.textContent = data.siteSubtitle || '';

    // Fade in header content after loading
    if (homeLink) homeLink.classList.add('loaded');
  } catch (err) {
    console.error('Error loading site theme:', err);
    // Still show header even on error with fallback text
    const siteTitleEl = document.querySelector('.site-title');
    const siteSubtitleEl = document.querySelector('.site-subtitle');
    if (siteTitleEl && !siteTitleEl.textContent) {
      siteTitleEl.innerHTML = 'Matt Banzhof <span class="site-title-separator">|</span> <span id="site-role-text">Electrical Engineer</span><span class="site-title-cursor">|</span>';
    }
    if (siteSubtitleEl && !siteSubtitleEl.textContent) siteSubtitleEl.textContent = '';
    if (homeLink) homeLink.classList.add('loaded');
  }
});

// === About page header role animation ===
document.addEventListener('DOMContentLoaded', function () {
  // Only run on the About page
  const isAboutPage =
    document.body.classList.contains('about-page') ||
    window.location.pathname === '/about' ||
    window.location.pathname === '/about.html' ||
    window.location.pathname.endsWith('/about.html');

  if (!isAboutPage) return;

  // Small delay to ensure site.js has populated the title
  setTimeout(() => {
    const roleEl = document.getElementById('site-role-text');
    const cursorEl = document.querySelector('.site-title-cursor');
    if (!roleEl || !cursorEl) return;

    // Phrases to cycle through (edit this list as needed)
    const phrases = [
      'Electrical Engineer',
      'Innovator',
      'Problem Solver',
      'R&D Technologist'
    ];

    let phraseIndex = 0;
    let charIndex = phrases[0].length; // first phrase already "typed"
    let deleting = false;
    let holdTimeout = null;

    // Configurable timings
    const INITIAL_SOLID_DELAY = 10000;   // 10s before any blinking/typing
    const HOLD_AFTER_EACH_PHRASE = 30000; // 30s solid separator between animations
    const TYPE_SPEED = 80;                // ms per char when typing
    const DELETE_SPEED = 45;              // ms per char when deleting
    const BETWEEN_PHRASES_DELAY = 1000;   // small pause after deleting before typing next

    // Ensure initial text matches the first phrase
    roleEl.textContent = phrases[0];

    // Helper to activate/deactivate the cursor
    function setCursorActive(active) {
      if (active) {
        cursorEl.classList.add('is-active');
      } else {
        cursorEl.classList.remove('is-active');
      }
    }

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (!deleting && charIndex < currentPhrase.length) {
        // Typing forward
        charIndex++;
        roleEl.textContent = currentPhrase.slice(0, charIndex);
        setTimeout(typeLoop, TYPE_SPEED);
        return;
      }

      if (!deleting && charIndex === currentPhrase.length) {
        // Fully typed – hide cursor and hold phrase solid for a while
        setCursorActive(false);
        if (!holdTimeout) {
          holdTimeout = setTimeout(() => {
            deleting = true;
            holdTimeout = null;
            setCursorActive(true); // cursor returns at end, ready to delete
            typeLoop();
          }, HOLD_AFTER_EACH_PHRASE);
        }
        return;
      }

      if (deleting && charIndex > 0) {
        // Deleting characters
        charIndex--;
        roleEl.textContent = currentPhrase.slice(0, charIndex);
        setTimeout(typeLoop, DELETE_SPEED);
        return;
      }

      if (deleting && charIndex === 0) {
        // Finished deleting – move to next phrase
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;

        // Small pause before typing the next phrase
        setTimeout(() => {
          charIndex = 0;
          roleEl.textContent = '';
          typeLoop();
        }, BETWEEN_PHRASES_DELAY);

        return;
      }
    }

    // Initial behavior:
    // 1. For the first 10 seconds: show "Matt Banzhof | Electrical Engineer" with NO blinking cursor
    // 2. After 10 seconds: cursor appears at the right, starts blinking and begins the delete+type cycle
    setCursorActive(false); // solid header, no cursor animation

    setTimeout(() => {
      // Begin by deleting the first phrase (cursor at right, blinking)
      setCursorActive(true);
      deleting = true;
      typeLoop();
    }, INITIAL_SOLID_DELAY);
  }, 500); // Small delay to ensure DOM is ready
});
