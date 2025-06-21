// Function to fetch projects from Netlify function
async function fetchProjects() {
  try {
    const response = await fetch('/.netlify/functions/getprojects');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const projects = await response.json();
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Clear existing content
    projects.forEach(project => {
      const projectElement = document.createElement('div');
      projectElement.innerHTML = `
        <img src="${project.imageUrl}" alt="${project.title}">
        <p>${project.title}</p>
      `;
      gallery.appendChild(projectElement);
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
}

// Function to display projects in the gallery
function displayProjects(projects) {
  const galleryDiv = document.querySelector('.gallery');
  if (!projects || projects.length === 0) {
    galleryDiv.innerHTML = '<p>No projects to display yet.</p>';
    return;
  }

  const projectsHTML = projects.map(project => `
    <div class="project-card">
      ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    </div>
  `).join('');

  galleryDiv.innerHTML = projectsHTML;
}

// Load projects when the page loads
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

                    const projectImage = document.createElement('img');
                    projectImage.src = project.imageUrl;
                    projectImage.alt = project.title;

                    const projectTitle = document.createElement('h3');
                    projectTitle.textContent = project.title;

                    projectCard.appendChild(projectImage);
                    projectCard.appendChild(projectTitle);
                    galleryContainer.appendChild(projectCard);
                });
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
                galleryContainer.innerHTML = '<p>Error loading projects. Please try again later.</p>';
            });
    }
});
