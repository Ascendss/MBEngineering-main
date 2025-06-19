// Function to fetch projects from Netlify function
async function fetchProjects() {
  try {
    const response = await fetch('/.netlify/functions/getprojects');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const projects = await response.json();
    displayProjects(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    document.querySelector('.gallery').innerHTML = '<p>Error loading projects. Please try again later.</p>';
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
document.addEventListener('DOMContentLoaded', fetchProjects);
