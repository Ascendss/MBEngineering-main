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
                  const projectCard = document.createElement('div');
                  projectCard.className = 'project-card';

                  // This is the fix: check if imageUrl exists
                  if (project.imageUrl) {
                      const projectImage = document.createElement('img');
                      // This ensures the path is correct
                      projectImage.src = project.imageUrl.startsWith('/') ? project.imageUrl : `/${project.imageUrl}`;
                      projectImage.alt = project.title;
                      projectCard.appendChild(projectImage);
                  }

                  const projectTitle = document.createElement('h3');
                  projectTitle.textContent = project.title;
                  projectCard.appendChild(projectTitle);

                  // Make the whole card clickable – open the image in a new tab
                  projectCard.style.cursor = 'pointer';
                  projectCard.addEventListener('click', () => {
                    const imageUrl = project.image || project.imageUrl;
                    if (imageUrl) {
                      window.open(imageUrl, '_blank');
                    }
                  });
                  
                  galleryContainer.appendChild(projectCard);
              });
          })
          .catch(error => {
              console.error('Error fetching projects:', error);
              galleryContainer.innerHTML = '<p>Error loading projects. Please try again later.</p>';
          });
  }
});