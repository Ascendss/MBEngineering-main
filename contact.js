document.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.getElementById('contactContentWrapper');
  const titleEl = document.getElementById('contactPageTitle');
  const introEl = document.getElementById('contactIntro');
  const bodyEl = document.getElementById('contactBody');
  const emailLinkEl = document.getElementById('contactEmailLink');

  try {
    const res = await fetch('/content/contact.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load contact content');

    const data = await res.json();
    const title = data.title || 'Contact';
    const intro = data.intro || '';
    const email = data.email || 'youremail@example.com';
    const body = data.body || '';

    if (titleEl) titleEl.textContent = title;
    if (introEl) introEl.textContent = intro;

    if (emailLinkEl) {
      emailLinkEl.textContent = email;
      emailLinkEl.href = `mailto:${email}`;
    }

    if (bodyEl) {
      if (body && typeof marked !== 'undefined') {
        bodyEl.innerHTML = marked.parse(body);
      } else {
        bodyEl.innerHTML =
          '<p>If you'd like to get in touch, feel free to send me an email.</p>';
      }
    }

    if (wrapper) wrapper.classList.add('loaded');
  } catch (err) {
    console.error('Error loading contact.json:', err);
    if (bodyEl) {
      bodyEl.innerHTML =
        '<p>Unable to load contact information right now. Please try again later.</p>';
    }
    if (wrapper) wrapper.classList.add('loaded');
  }
});

