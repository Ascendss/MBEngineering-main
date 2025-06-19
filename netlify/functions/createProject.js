const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        const projectsFile = path.join(__dirname, '../../content/projects.json');
        const projectsDir = path.dirname(projectsFile);

        // Ensure projects directory exists
        await fs.mkdir(projectsDir, { recursive: true });

        // Read existing projects or create empty array
        let projects = [];
        try {
            const data = await fs.readFile(projectsFile, 'utf8');
            projects = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, that's ok
        }

        // Parse the new project data
        const projectData = JSON.parse(event.body);
        
        // Add id and timestamp
        const newProject = {
            id: Date.now().toString(),
            ...projectData,
            createdAt: new Date().toISOString()
        };

        // Add to projects array
        projects.push(newProject);

        // Save updated projects
        await fs.writeFile(projectsFile, JSON.stringify(projects, null, 2));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProject)
        };
    } catch (error) {
        console.error('Create project error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to create project',
                details: error.message
            })
        };
    }
}; 