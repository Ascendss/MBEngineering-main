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
      // If title contains a pipe, create a single role block for animation
      if (title.includes('|')) {
        const parts = title.split('|');
        const name = parts[0].trim();
        const role = parts.slice(1).join('|').trim();
        // Single span containing "| Role" that the animation will manipulate
        siteTitleEl.innerHTML = `${name} <span id="site-role-block">| ${role}</span>`;
      } else {
        siteTitleEl.textContent = title;
      }
    }
    if (siteSubtitleEl) siteSubtitleEl.textContent = data.siteSubtitle || '';

    // Make header roles available globally for the About page animation
    window.SITE_HEADER_ROLES = Array.isArray(data.headerRoles) && data.headerRoles.length > 0
      ? data.headerRoles.slice()
      : ['Electrical Engineer'];

    // Fade in header content after loading
    if (homeLink) homeLink.classList.add('loaded');
  } catch (err) {
    console.error('Error loading site theme:', err);
    // Still show header even on error with fallback text
    const siteTitleEl = document.querySelector('.site-title');
    const siteSubtitleEl = document.querySelector('.site-subtitle');
    if (siteTitleEl && !siteTitleEl.textContent) {
      siteTitleEl.innerHTML = 'Matt Banzhof <span id="site-role-block">| Electrical Engineer</span>';
    }
    if (siteSubtitleEl && !siteSubtitleEl.textContent) siteSubtitleEl.textContent = '';
    if (homeLink) homeLink.classList.add('loaded');
  }
});

// === Header animation (center '|' moves and returns) - runs on all pages ===
document.addEventListener('DOMContentLoaded', function () {
  // Small delay to ensure site.js has populated the title
  setTimeout(() => {
    const roleBlock = document.getElementById('site-role-block');
    if (!roleBlock) return; // no header on this page, do nothing

    // Phrases to cycle through (from site config or fallback)
    const phrases = (Array.isArray(window.SITE_HEADER_ROLES) && window.SITE_HEADER_ROLES.length > 0)
      ? window.SITE_HEADER_ROLES
      : ['Electrical Engineer'];

    let phraseIndex = 0;
    let isFirstPhrase = true;

    // Timing configuration
    const FIRST_REST_MS = 2000;        // 2s solid before first animation
    const REST_MS = 7000;              // 7s solid for each phrase thereafter
    const SCAN_INTERVAL_MS = 60;       // speed of cursor scanning right
    const DELETE_INTERVAL_MS = 45;     // speed of deleting
    const TYPE_INTERVAL_MS = 80;       // speed of typing
    const PAUSE_AFTER_SCAN_MS = 300;   // small pause at end of scan-right
    const PAUSE_AFTER_DELETE_MS = 200; // pause before typing next phrase
    const PAUSE_AFTER_TYPE_MS = 300;   // pause before scanning back to center
    const SCAN_BACK_INTERVAL_MS = 60;  // speed for scan back to center
    const SETTLE_BLINK_MS = 1500;      // total settle period duration
    const CURSOR_BLINK_INTERVAL = 400; // cursor on/off toggle speed

    // REST state: "| Phrase" with center bar, solid
    function setRestText(phrase) {
      roleBlock.textContent = `| ${phrase}`;
    }

    // Blink just the "|" cursor at center for a duration (text stays solid)
    function blinkCursorAtCenter(phrase, duration) {
      return new Promise((resolve) => {
        let cursorVisible = true;
        const startTime = Date.now();

        function toggle() {
          const elapsed = Date.now() - startTime;
          if (elapsed >= duration) {
            // Ensure cursor is visible when done
            roleBlock.textContent = `| ${phrase}`;
            resolve();
            return;
          }

          cursorVisible = !cursorVisible;
          if (cursorVisible) {
            roleBlock.textContent = `| ${phrase}`;  // cursor ON
          } else {
            roleBlock.textContent = `  ${phrase}`;  // cursor OFF (space instead)
          }

          setTimeout(toggle, CURSOR_BLINK_INTERVAL);
        }

        // Start with cursor visible, then begin toggling
        roleBlock.textContent = `| ${phrase}`;
        setTimeout(toggle, CURSOR_BLINK_INTERVAL);
      });
    }

    // Phase 1: SCAN RIGHT - move cursor from center through the phrase
    // "| Electrical" -> " E|lectrical" -> " El|ectrical" -> ... -> " Electrical|"
    function scanPhraseRight(phrase) {
      return new Promise((resolve) => {
        let i = 0;
        const total = phrase.length;

        function step() {
          if (i > total) {
            setTimeout(resolve, PAUSE_AFTER_SCAN_MS);
            return;
          }
          const left = phrase.slice(0, i);
          const right = phrase.slice(i);
          roleBlock.textContent = ` ${left}|${right}`;
          i++;
          setTimeout(step, SCAN_INTERVAL_MS);
        }

        step();
      });
    }

    // Phase 2: DELETE - remove phrase from right with cursor at end
    // " Electrical|" -> " Electrica|" -> ... -> " |"
    function deletePhrase(phrase) {
      return new Promise((resolve) => {
        let len = phrase.length;

        function step() {
          if (len < 0) {
            setTimeout(resolve, PAUSE_AFTER_DELETE_MS);
            return;
          }
          const visible = phrase.slice(0, len);
          roleBlock.textContent = ` ${visible}|`;
          len--;
          setTimeout(step, DELETE_INTERVAL_MS);
        }

        step();
      });
    }

    // Phase 3: TYPE - type new phrase from left with cursor at end
    // " |" -> " I|" -> " In|" -> ... -> " Innovator|"
    function typePhrase(phrase) {
      return new Promise((resolve) => {
        let len = 0;

        function step() {
          if (len > phrase.length) {
            setTimeout(resolve, PAUSE_AFTER_TYPE_MS);
            return;
          }
          const visible = phrase.slice(0, len);
          roleBlock.textContent = ` ${visible}|`;
          len++;
          setTimeout(step, TYPE_INTERVAL_MS);
        }

        step();
      });
    }

    // Phase 4: SCAN BACK - cursor walks back from right edge to center
    // " Innovator|" -> " Innovato|r" -> ... -> " |Innovator"
    function scanBackToCenter(phrase) {
      return new Promise((resolve) => {
        let i = phrase.length;

        function step() {
          if (i < 0) {
            resolve();
            return;
          }
          const left = phrase.slice(0, i);
          const right = phrase.slice(i);
          roleBlock.textContent = ` ${left}|${right}`;
          i--;
          setTimeout(step, SCAN_BACK_INTERVAL_MS);
        }

        step();
      });
    }

    // Main animation cycle
    async function runCycle() {
      const current = phrases[phraseIndex];

      // REST: center "|" solid with current phrase
      setRestText(current);

      // Different rest time for first phrase vs subsequent
      const restTime = isFirstPhrase ? FIRST_REST_MS : REST_MS;
      isFirstPhrase = false;

      // Rest period (solid cursor at center)
      await new Promise((resolve) => setTimeout(resolve, restTime));

      // ANIMATION: scan right through current phrase
      await scanPhraseRight(current);

      // Delete current phrase (cursor stays at end)
      await deletePhrase(current);

      // Move to next phrase
      phraseIndex = (phraseIndex + 1) % phrases.length;
      const next = phrases[phraseIndex];

      // Type next phrase (cursor at end)
      await typePhrase(next);

      // Scan cursor back to center letter-by-letter (no teleport!)
      await scanBackToCenter(next);

      // SETTLE: cursor blinks on/off at center while text stays solid
      await blinkCursorAtCenter(next, SETTLE_BLINK_MS);

      // Cursor is now solid at center
      setRestText(next);

      // Schedule next cycle (solid rest with new phrase)
      setTimeout(runCycle, REST_MS);
    }

    // Initialize with first phrase in REST state
    setRestText(phrases[0]);

    // Start the animation cycle
    runCycle();
  }, 500);
});
