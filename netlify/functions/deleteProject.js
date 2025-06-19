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
        
        // Read existing projects
        let projects = [];
        try {
            const data = await fs.readFile(projectsFile, 'utf8');
            projects = JSON.parse(data);
        } catch (error) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No projects found' })
            };
        }

        // Parse the project ID to delete
        const { id } = JSON.parse(event.body);
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Project ID is required' })
            };
        }

        // Find the project to delete
        const projectIndex = projects.findIndex(p => p.id === id);
        if (projectIndex === -1) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Project not found' })
            };
        }

        // Get the project to delete (for image cleanup)
        const projectToDelete = projects[projectIndex];

        // Remove the project
        projects.splice(projectIndex, 1);

        // Save updated projects
        await fs.writeFile(projectsFile, JSON.stringify(projects, null, 2));

        // If project had an image, try to delete it
        if (projectToDelete.image) {
            try {
                const imagePath = path.join(__dirname, '../..', projectToDelete.image);
                await fs.unlink(imagePath);
            } catch (error) {
                console.error('Failed to delete image file:', error);
                // Continue even if image deletion fails
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Project deleted successfully' })
        };
    } catch (error) {
        console.error('Delete project error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to delete project',
                details: error.message
            })
        };
    }
}; 