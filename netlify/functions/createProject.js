// const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
    const { Octokit } = await import("@octokit/rest");
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const projectsFilePath = 'content/projects.json';

    try {
        const newProjectData = JSON.parse(event.body);
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
            const fileContent = Buffer.from(existingFile.content, 'base64').toString('utf8');
            projects = JSON.parse(fileContent);

        } catch (error) {
            if (error.status !== 404) throw error;
            // File doesn't exist, which is fine. We'll create it.
        }

        const project = {
            id: Date.now().toString(),
            ...newProjectData,
            createdAt: new Date().toISOString()
        };
        projects.push(project);

        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            path: projectsFilePath,
            message: `feat: Add project ${project.title}`,
            content: Buffer.from(JSON.stringify(projects, null, 2)).toString('base64'),
            branch: 'main',
            sha: existingFileSha
        });

        return {
            statusCode: 200,
            body: JSON.stringify(project)
        };

    } catch (error) {
        console.error('Create project error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create project.', details: error.message })
        };
    }
}; 
