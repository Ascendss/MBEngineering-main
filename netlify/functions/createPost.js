exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server is not configured. Missing GitHub environment variables.' })
        };
    }

    const postsFilePath = 'content/posts.json';

    try {
        const newPostData = JSON.parse(event.body);
        let posts = [];
        let existingFileSha = null;

        // Try to get existing file
        const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${postsFilePath}?ref=main`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            }
        });

        if (getResponse.ok) {
            const existingFile = await getResponse.json();
            existingFileSha = existingFile.sha;
            posts = JSON.parse(Buffer.from(existingFile.content, 'base64').toString('utf8'));
        } else if (getResponse.status !== 404) {
            throw new Error(`Failed to get existing file: ${getResponse.statusText}`);
        }

        const post = {
            id: Date.now().toString(),
            ...newPostData,
            createdAt: new Date().toISOString()
        };
        posts.push(post);

        // Create or update the file
        const putUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${postsFilePath}`;
        const putBody = {
            message: `feat: Add post ${post.title}`,
            content: Buffer.from(JSON.stringify(posts, null, 2)).toString('base64'),
            branch: 'main'
        };

        if (existingFileSha) {
            putBody.sha = existingFileSha;
        }

        const putResponse = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify(putBody)
        });

        if (!putResponse.ok) {
            const errorBody = await putResponse.json().catch(() => ({}));
            throw new Error(`GitHub API error: ${errorBody.message || putResponse.statusText}`);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
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
