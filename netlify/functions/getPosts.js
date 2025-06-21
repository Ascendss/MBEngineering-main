// const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
    const { Octokit } = await import("@octokit/rest");
    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const postsFilePath = 'content/posts.json';

    try {
        const { data: file } = await octokit.repos.getContent({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            path: postsFilePath,
            branch: 'main',
        });

        const posts = Buffer.from(file.content, 'base64').toString('utf8');

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: posts
        };

    } catch (error) {
        if (error.status === 404) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify([])
            };
        }
        
        console.error('Get posts error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to load posts.', details: error.message })
        };
    }
}; 
