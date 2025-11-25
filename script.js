document.addEventListener('DOMContentLoaded', function() {
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
