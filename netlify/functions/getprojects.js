const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const projectsFilePath = 'content/projects.json';

    try {
        const { data: file } = await octokit.repos.getContent({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            path: projectsFilePath,
            branch: 'main',
        });

        const projects = Buffer.from(file.content, 'base64').toString('utf8');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: projects
        };

    } catch (error) {
        if (error.status === 404) {
            // If the file doesn't exist, return an empty array.
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify([])
            };
        }
        
        console.error('Get projects error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to load projects.', details: error.message })
        };
    }
}; 
