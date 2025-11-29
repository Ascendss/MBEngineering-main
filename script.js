document.addEventListener('DOMContentLoaded', function() {
  // ==================== HEADER SCROLL EFFECT ====================
  const header = document.querySelector('header');
  if (header) {
    function updateHeaderShadow() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow);
  }

  // ==================== ACTIVE NAV LINK HIGHLIGHTING ====================
  const navLinks = document.querySelectorAll('nav a');
  const path = window.location.pathname.replace(/index\.html$/, '');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    // Check if current path ends with the href, or if we're on home page
    if (path.endsWith(href) || (path === '/' && href === 'index.html') || path.endsWith('/' + href)) {
      link.classList.add('is-active');
    }
  });

  // ==================== GALLERY ====================
  const galleryContainer = document.getElementById('gallery-container');

  if (galleryContainer) {
    fetch('/.netlify/functions/getprojects')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(projects => {
        galleryContainer.innerHTML = ''; // Clear existing content
        projects.forEach(project => {
          const card = document.createElement('div');
          card.className = 'project-card';

          // Support both new (heroImage) and old (imageUrl/image) field names
          const imageUrl = project.heroImage || project.imageUrl || project.image;
          const summary = project.summary || project.description || '';

          // Build card HTML with thumbnail + title + summary
          let cardHTML = '';
          if (imageUrl) {
            cardHTML += `<img src="${imageUrl}" alt="${project.title}" class="project-thumb" />`;
          }
          cardHTML += `<h3>${project.title}</h3>`;
          if (summary) {
            cardHTML += `<p class="project-summary">${summary}</p>`;
          }
          card.innerHTML = cardHTML;

          // Make the whole card clickable
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => {
            if (project.slug) {
              // New projects with slug go to detail page
              window.location.href = `/project.html?slug=${encodeURIComponent(project.slug)}`;
            } else if (imageUrl) {
              // Fallback for old entries without slug - open image in new tab
              window.open(imageUrl, '_blank');
            }
          });

          galleryContainer.appendChild(card);
        });
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
        galleryContainer.innerHTML = '<p>Error loading projects. Please try again later.</p>';
      });
  }
});
