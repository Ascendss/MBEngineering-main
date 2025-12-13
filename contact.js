// Enable line breaks in markdown (single Enter = <br>)
if (typeof marked !== 'undefined') {
  marked.setOptions({ breaks: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('contact.js: Starting...');
  
  const wrapper = document.getElementById('contactContentWrapper');
  const titleEl = document.getElementById('contactPageTitle');
  const introEl = document.getElementById('contactIntro');
  const bodyEl = document.getElementById('contactBody');
  const emailLinkEl = document.getElementById('contactEmailLink');

  // If the wrapper isn't found, just bail out gracefully.
  if (!wrapper) {
    console.warn('contact.js: #contactContentWrapper not found');
    return;
  }

  try {
    console.log('contact.js: Fetching contact.json...');
    const res = await fetch('/content/contact.json', { cache: 'no-cache' });
    
    if (!res.ok) {
      console.error('contact.js: Fetch failed with status', res.status);
      throw new Error('Failed to load contact content');
    }

    const data = await res.json();
    console.log('contact.js: Data loaded:', data);

    const title = data.title || 'Contact';
    const intro = data.intro || '';
    const email = data.email || 'youremail@example.com';
    const body = data.body || '';

    if (titleEl) {
      titleEl.textContent = title;
      console.log('contact.js: Set title to:', title);
    }
    
    if (introEl) {
      introEl.textContent = intro;
      console.log('contact.js: Set intro to:', intro);
    }

    if (emailLinkEl) {
      emailLinkEl.textContent = email;
      emailLinkEl.href = `mailto:${email}`;
      console.log('contact.js: Set email to:', email);
    }

    if (bodyEl) {
      if (body && typeof marked !== 'undefined') {
        bodyEl.innerHTML = marked.parse(body);
        console.log('contact.js: Rendered body markdown');
      } else if (body) {
        // Fallback if marked isn't loaded - just show as paragraph
        bodyEl.innerHTML = `<p>${body}</p>`;
        console.log('contact.js: Rendered body as plain text (marked not available)');
      } else {
        bodyEl.innerHTML = '<p>If you\'d like to get in touch, feel free to send me an email.</p>';
      }
    }

    if (wrapper) wrapper.classList.add('loaded');
    console.log('contact.js: Done!');
    
  } catch (err) {
    console.error('contact.js: Error loading contact.json:', err);
    
    // Show fallback content on error
    if (titleEl) titleEl.textContent = 'Contact';
    if (introEl) introEl.textContent = 'Let\'s connect.';
    if (bodyEl) {
      bodyEl.innerHTML = '<p>Unable to load contact information right now. Please try again later.</p>';
    }
    if (wrapper) wrapper.classList.add('loaded');
  }
});
