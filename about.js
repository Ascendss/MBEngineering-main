// Enable line breaks in markdown (single Enter = <br>)
if (typeof marked !== 'undefined') {
  marked.setOptions({ breaks: true });
}

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
    
    // Populate tagline - use headerRoles if available, otherwise plain tagline
    const headerRoles = Array.isArray(data.headerRoles) ? data.headerRoles : [];
    
    if (taglineEl) {
      if (headerRoles.length > 0) {
        // Build role cards - each icon paired with its tag
        let rolesHtml = '<div class="about-roles-grid">';
        
        headerRoles.forEach(role => {
          if (role.label && role.label.trim()) {
            const hasIcon = role.iconUrl && role.iconUrl.trim();
            rolesHtml += `
              <div class="about-role-item">
                ${hasIcon ? `<div class="about-role-icon"><img src="${role.iconUrl}" alt="${role.label} icon"></div>` : ''}
                <span class="about-tag">${role.label}</span>
              </div>
            `;
          }
        });
        
        rolesHtml += '</div>';
        
        // Add "experienced in" line below the roles
        rolesHtml += '<p class="about-experienced-in">Experienced in</p>';
        
        taglineEl.innerHTML = rolesHtml;
      } else {
        // Fallback to plain tagline text
        taglineEl.textContent = data.tagline || '';
      }
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
      // Render in the order stored in about.json (no auto-sorting)
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

        // Create the body wrapper with expand/collapse structure
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'timeline-body';

        const bodyInner = document.createElement('div');
        bodyInner.className = 'timeline-body-inner collapsed';
        
        if (item.body) {
          if (typeof marked !== 'undefined') {
            bodyInner.innerHTML = marked.parse(item.body);
          } else {
            bodyInner.textContent = item.body;
          }
        }

        // Create the toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'timeline-toggle';
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<span class="toggle-label">Show details</span><span class="toggle-icon">▼</span>';

        bodyWrapper.appendChild(bodyInner);
        bodyWrapper.appendChild(toggleBtn);

        content.appendChild(dateEl);
        content.appendChild(headlineEl);
        content.appendChild(bodyWrapper);

        wrapper.appendChild(dot);
        wrapper.appendChild(content);

        timelineContainer.appendChild(wrapper);
      });

      // Initialize expand/collapse functionality for timeline items
      const timelineItems = timelineContainer.querySelectorAll('.timeline-item');
      timelineItems.forEach((item) => {
        const bodyInner = item.querySelector('.timeline-body-inner');
        const toggle = item.querySelector('.timeline-toggle');
        if (!bodyInner || !toggle) return;

        // If the content is short, hide the toggle and show everything
        const textLength = (bodyInner.textContent || '').trim().length;
        if (textLength < 160) {
          bodyInner.classList.remove('collapsed');
          bodyInner.classList.add('expanded');
          toggle.classList.add('hidden');
          return;
        }

        // Start collapsed
        bodyInner.classList.add('collapsed');
        bodyInner.classList.remove('expanded');
        toggle.setAttribute('aria-expanded', 'false');

        const labelSpan = toggle.querySelector('.toggle-label');

        toggle.addEventListener('click', () => {
          const isExpanded = bodyInner.classList.toggle('expanded');
          bodyInner.classList.toggle('collapsed', !isExpanded);
          toggle.classList.toggle('open', isExpanded);
          toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

          if (labelSpan) {
            labelSpan.textContent = isExpanded ? 'Hide details' : 'Show details';
          }
        });
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
