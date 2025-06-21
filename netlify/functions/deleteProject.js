const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const projectsFilePath = 'content/projects.json';

    try {
        const { id } = JSON.parse(event.body);
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Project ID is required' }) };
        }

        let projects = [];
        let existingFileSha = null;

        try {
            const { data: existingFile } = await octokit.repos.getContent({
                owner: GITHUB_REPO_OWNER,
                repo: GITHUB_REPO_NAME,
                path: projectsFilePath,
                branch: 'main',
            });
            
            existingFileSha = existingFile.sha;
            projects = JSON.parse(Buffer.from(existingFile.content, 'base64').toString('utf8'));
        } catch (error) {
            // If the file doesn't exist, there's nothing to delete.
            if (error.status === 404) {
                return { statusCode: 404, body: JSON.stringify({ error: 'No projects found to delete from.' }) };
            }
            throw error;
        }

        const projectToDelete = projects.find(p => p.id === id);
        const updatedProjects = projects.filter(p => p.id !== id);

        if (projects.length === updatedProjects.length) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Project not found' }) };
        }

        // Delete the associated image from the repo
        if (projectToDelete && projectToDelete.image) {
            try {
                const imagePath = projectToDelete.image.startsWith('/') 
                    ? projectToDelete.image.substring(1) 
                    : projectToDelete.image;

                const { data: imageFile } = await octokit.repos.getContent({
                    owner: GITHUB_REPO_OWNER,
                    repo: GITHUB_REPO_NAME,
                    path: imagePath,
                    branch: 'main',
                });

                await octokit.repos.deleteFile({
                    owner: GITHUB_REPO_OWNER,
                    repo: GITHUB_REPO_NAME,
                    path: imagePath,
                    message: `feat: Delete project image ${imagePath}`,
                    sha: imageFile.sha,
                    branch: 'main'
                });
            } catch (error) {
                if (error.status !== 404) {
                    console.error("Failed to delete project image, but proceeding.", error);
                }
                // If image not found, just continue to update the projects.json
            }
        }

        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            path: projectsFilePath,
            message: `feat: Delete project ${projectToDelete.title}`,
            content: Buffer.from(JSON.stringify(updatedProjects, null, 2)).toString('base64'),
            branch: 'main',
            sha: existingFileSha
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Project deleted successfully' })
        };

    } catch (error) {
        console.error('Delete project error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete project.', details: error.message })
        };
    }
}; 
