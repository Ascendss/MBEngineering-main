document.addEventListener('DOMContentLoaded', async () => {
  const contentWrapper = document.getElementById('aboutContentWrapper');
  
  try {
    const res = await fetch('/content/about.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load about content');
    const data = await res.json();

    // Hero text elements
    const titleEl = document.getElementById('aboutPageTitle');
    const taglineEl = document.getElementById('aboutTagline');
    
    // Avatar element (circular profile image)
    const avatarEl = document.getElementById('aboutAvatar');
    const avatarWrapper = document.querySelector('.about-avatar-wrapper');
    
    // Body content
    const bodyEl = document.getElementById('aboutBody');

    // Populate title
    if (titleEl) {
      titleEl.textContent = data.title || 'About';
    }
    
    // Populate tagline
    if (taglineEl) {
      taglineEl.textContent = data.tagline || '';
    }

    // Populate avatar - show wrapper only if image exists
    if (avatarEl && data.profileImage) {
      avatarEl.src = data.profileImage;
      avatarEl.style.display = 'block';
      if (avatarWrapper) avatarWrapper.style.display = 'block';
    } else if (avatarWrapper) {
      // Hide avatar wrapper if no image
      avatarWrapper.style.display = 'none';
    }

    // Render markdown content
    const markdown = data.content || '';
    if (bodyEl) {
      bodyEl.innerHTML = markdown 
        ? marked.parse(markdown) 
        : '<p>About content coming soon.</p>';
    }

    // ===== Render Timeline =====
    const timelineContainer = document.getElementById('aboutTimeline');
    const timelineSection = document.getElementById('aboutTimelineSection');
    const timeline = Array.isArray(data.timeline) ? data.timeline : [];

    if (timelineContainer && timeline.length > 0) {
      timelineContainer.innerHTML = '';

      timeline.forEach((item, index) => {
        const wrapper = document.createElement('article');
        wrapper.className = 'timeline-item';
        if (index % 2 === 1) {
          wrapper.classList.add('timeline-item--right');
        }

        const dot = document.createElement('div');
        dot.className = 'timeline-dot';

        const content = document.createElement('div');
        content.className = 'timeline-content';

        // Optional image inside card
        if (item.imageUrl) {
          const imageEl = document.createElement('img');
          imageEl.className = 'timeline-image';
          imageEl.src = item.imageUrl;
          imageEl.alt = item.headline || item.date || 'Timeline image';
          content.appendChild(imageEl);
        }

        const dateEl = document.createElement('div');
        dateEl.className = 'timeline-date';
        dateEl.textContent = item.date || '';

        const headlineEl = document.createElement('h3');
        headlineEl.className = 'timeline-headline';
        headlineEl.textContent = item.headline || '';

        const bodyEl = document.createElement('div');
        bodyEl.className = 'timeline-body';
        if (item.body) {
          if (typeof marked !== 'undefined') {
            bodyEl.innerHTML = marked.parse(item.body);
          } else {
            bodyEl.textContent = item.body;
          }
        }

        content.appendChild(dateEl);
        content.appendChild(headlineEl);
        content.appendChild(bodyEl);

        wrapper.appendChild(dot);
        wrapper.appendChild(content);

        timelineContainer.appendChild(wrapper);
      });

      // Show the timeline section
      if (timelineSection) {
        timelineSection.style.display = 'block';
      }
    } else if (timelineSection) {
      // Hide timeline section if no entries
      timelineSection.style.display = 'none';
    }

    // Fade in content after loading
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  } catch (err) {
    console.error('Error loading about.json:', err);
    const bodyEl = document.getElementById('aboutBody');
    if (bodyEl) {
      bodyEl.innerHTML = '<p>Unable to load About content right now.</p>';
    }
    // Still show the content even on error
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  }
});
