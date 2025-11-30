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
      // If title contains a pipe, create structured markup with center separator as cursor
      if (title.includes('|')) {
        const parts = title.split('|');
        const name = parts[0].trim();
        const role = parts.slice(1).join('|').trim();
        // Single center bar that acts as both separator AND cursor (no extra cursor at end)
        siteTitleEl.innerHTML = `${name} <span id="site-role-separator" class="site-title-separator">|</span> <span id="site-role-text">${role}</span>`;
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
      siteTitleEl.innerHTML = 'Matt Banzhof <span id="site-role-separator" class="site-title-separator">|</span> <span id="site-role-text">Electrical Engineer</span>';
    }
    if (siteSubtitleEl && !siteSubtitleEl.textContent) siteSubtitleEl.textContent = '';
    if (homeLink) homeLink.classList.add('loaded');
  }
});

// === About page header role animation (center '|' as cursor) ===
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
    const separatorEl = document.getElementById('site-role-separator');

    if (!roleEl || !separatorEl) return;

    // Phrases to cycle through (edit as desired)
    const phrases = [
      'Electrical Engineer',
      'Innovator',
      'Problem Solver',
      'R&D Technologist'
    ];

    // Start showing the first phrase immediately
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = false;
    let holdTimeout = null;

    const INITIAL_SOLID_DELAY = 5000;     // 5s solid bar before any blinking/typing
    const HOLD_EACH_PHRASE = 10000;       // 10s each full phrase is visible
    const TYPE_SPEED = 80;                // typing speed (ms per char)
    const DELETE_SPEED = 50;              // deleting speed (ms per char)
    const BETWEEN_PHRASES_DELAY = 800;    // small pause after deleting before next phrase

    // Ensure initial visible phrase is correct
    roleEl.textContent = phrases[0];

    function setCursorActive(active) {
      if (active) {
        separatorEl.classList.add('is-active');
      } else {
        separatorEl.classList.remove('is-active');
      }
    }

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (!deleting && charIndex < currentPhrase.length) {
        // Typing characters forward
        charIndex++;
        roleEl.textContent = currentPhrase.slice(0, charIndex);
        setTimeout(typeLoop, TYPE_SPEED);
        return;
      }

      if (!deleting && charIndex === currentPhrase.length) {
        // Phrase is fully typed; keep cursor blinking and hold the phrase for a bit
        if (!holdTimeout) {
          holdTimeout = setTimeout(() => {
            deleting = true;
            holdTimeout = null;
            typeLoop();
          }, HOLD_EACH_PHRASE);
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
        // Finished deleting current phrase – advance to next
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;

        // Brief pause before typing next phrase
        setTimeout(() => {
          charIndex = 0;
          roleEl.textContent = '';
          typeLoop();
        }, BETWEEN_PHRASES_DELAY);

        return;
      }
    }

    // Initial behavior:
    // 1. Show "Matt Banzhof | Electrical Engineer" with solid (non-blinking) bar for 5 seconds.
    // 2. After 5 seconds, bar begins blinking and we start deleting the first phrase.
    setCursorActive(false); // solid, non-blinking

    setTimeout(() => {
      // Start blinking and begin deletion/typing cycle
      setCursorActive(true);
      deleting = true; // we start by deleting the first phrase
      typeLoop();
    }, INITIAL_SOLID_DELAY);
  }, 500); // Small delay to ensure DOM is ready
});
