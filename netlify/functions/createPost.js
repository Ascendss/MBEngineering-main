const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const postsFilePath = 'content/posts.json';

    try {
        const newPostData = JSON.parse(event.body);
        let posts = [];
        let existingFileSha = null;

        try {
            const { data: existingFile } = await octokit.repos.getContent({
                owner: GITHUB_REPO_OWNER,
                repo: GITHUB_REPO_NAME,
                path: postsFilePath,
                branch: 'main',
            });
            
            existingFileSha = existingFile.sha;
            posts = JSON.parse(Buffer.from(existingFile.content, 'base64').toString('utf8'));
        } catch (error) {
            if (error.status !== 404) throw error;
        }

        const post = {
            id: Date.now().toString(),
            ...newPostData,
            createdAt: new Date().toISOString()
        };
        posts.push(post);

        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            path: postsFilePath,
            message: `feat: Add post ${post.title}`,
            content: Buffer.from(JSON.stringify(posts, null, 2)).toString('base64'),
            branch: 'main',
            sha: existingFileSha
        });

        return {
            statusCode: 200,
            body: JSON.stringify(post)
        };

    } catch (error) {
        console.error('Create post error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create post.', details: error.message })
        };
    }
}; 
