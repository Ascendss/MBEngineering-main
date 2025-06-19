// Function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Authentication handling
function checkAuth() {
    const user = netlifyIdentity.currentUser();
    const loginContainer = document.getElementById('login-container');
    const adminContent = document.getElementById('admin-content');

    if (!user) {
        loginContainer.style.display = 'flex';
        adminContent.style.display = 'none';
    } else {
        loginContainer.style.display = 'none';
        adminContent.style.display = 'block';
        loadProjects();
        loadPosts();
    }
}

// Set up authentication listeners
netlifyIdentity.on('init', user => {
    checkAuth();
});

netlifyIdentity.on('login', () => {
    checkAuth();
});

netlifyIdentity.on('logout', () => {
    checkAuth();
});

// Handle logout button
document.getElementById('logout-button').addEventListener('click', (e) => {
    e.preventDefault();
    netlifyIdentity.logout();
});

// Function to handle project uploads
async function handleProjectUpload(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const image = formData.get('image');

    try {
        // First convert image to base64
        const base64Image = await fileToBase64(image);
        
        // Upload the image
        const uploadResponse = await fetch('/.netlify/functions/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: image.name,
                content: base64Image,
                contentType: image.type
            })
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
        }

        const { imageUrl } = await uploadResponse.json();

        // Then create the project with the image URL
        const projectData = {
            title,
            description,
            image: imageUrl
        };

        const response = await fetch('/.netlify/functions/createProject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error('Failed to create project');
        }

        // Clear form and refresh projects list
        event.target.reset();
        loadProjects();
        alert('Project created successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create project: ' + error.message);
    }
}

// Function to load and display existing projects
async function loadProjects() {
    try {
        const response = await fetch('/.netlify/functions/getprojects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();
        const projectsList = document.getElementById('projectsList');
        
        if (!Array.isArray(projects)) {
            throw new Error('Expected projects to be an array');
        }

        if (projects.length === 0) {
            projectsList.innerHTML = '<p>No projects yet</p>';
            return;
        }
        
        projectsList.innerHTML = projects.map(project => `
            <div class="project-card">
                <img src="${project.image}" alt="${project.title}">
                <div class="card-content">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                </div>
                <div class="card-actions">
                    <button onclick="deleteProject('${project.id}')" class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('projectsList').innerHTML = `<p>Error loading projects: ${error.message}</p>`;
    }
}

// Function to delete a project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/deleteProject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: projectId })
        });

        if (!response.ok) {
            throw new Error('Failed to delete project');
        }

        loadProjects();
        alert('Project deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete project: ' + error.message);
    }
}

// Function to handle blog post creation
async function handleBlogPost(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const content = formData.get('content');
    const image = formData.get('image');

    try {
        let imageUrl = null;
        
        if (image && image.size > 0) {
            // Convert image to base64
            const base64Image = await fileToBase64(image);
            
            const uploadResponse = await fetch('/.netlify/functions/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: image.name,
                    content: base64Image,
                    contentType: image.type
                })
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }

            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.imageUrl;
        }

        const postData = {
            title,
            content,
            image: imageUrl,
            date: new Date().toISOString()
        };

        const response = await fetch('/.netlify/functions/createPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            throw new Error('Failed to create blog post');
        }

        event.target.reset();
        loadPosts();
        alert('Blog post created successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create blog post: ' + error.message);
    }
}

// Function to load and display existing blog posts
async function loadPosts() {
    try {
        const response = await fetch('/.netlify/functions/getPosts');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const posts = await response.json();
        const postsList = document.getElementById('postsList');
        
        if (!Array.isArray(posts)) {
            throw new Error('Expected posts to be an array');
        }

        if (posts.length === 0) {
            postsList.innerHTML = '<p>No blog posts yet</p>';
            return;
        }
        
        postsList.innerHTML = posts.map(post => `
            <div class="post-card">
                ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
                <div class="card-content">
                    <h4>${post.title}</h4>
                    <p>${new Date(post.date).toLocaleDateString()}</p>
                </div>
                <div class="card-actions">
                    <button onclick="deletePost('${post.id}')" class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('postsList').innerHTML = `<p>Error loading blog posts: ${error.message}</p>`;
    }
}

// Function to delete a blog post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this blog post?')) {
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/deletePost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: postId })
        });

        if (!response.ok) {
            throw new Error('Failed to delete blog post');
        }

        loadPosts();
        alert('Blog post deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete blog post: ' + error.message);
    }
}

// Initialize the admin interface
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Netlify Identity
    netlifyIdentity.init();

    // Set up form handlers
    document.getElementById('projectForm').addEventListener('submit', handleProjectUpload);
    document.getElementById('blogForm').addEventListener('submit', handleBlogPost);
}); 