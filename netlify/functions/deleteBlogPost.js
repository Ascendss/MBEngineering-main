exports.handler = async function(event) {
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
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

    const blogFilePath = 'content/blog.json';

    try {
        const { id } = JSON.parse(event.body || '{}');
        
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Blog post ID is required.' })
            };
        }

        let posts = [];
        let existingFileSha = null;

        // Get existing file
        const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${blogFilePath}?ref=main`;
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
            const fileContent = Buffer.from(existingFile.content, 'base64').toString('utf8');
            posts = JSON.parse(fileContent);
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Blog file not found.' })
            };
        }

        // Find the post to delete
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Blog post not found.' })
            };
        }

        const deletedPost = posts[postIndex];
        posts.splice(postIndex, 1);

        // Save updated posts
        const putUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${blogFilePath}`;
        const putBody = {
            message: `feat: Delete blog post "${deletedPost.title}"`,
            content: Buffer.from(JSON.stringify(posts, null, 2)).toString('base64'),
            branch: 'main',
            sha: existingFileSha
        };

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, deleted: deletedPost.title })
        };

    } catch (error) {
        console.error('Delete blog post error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete blog post.', details: error.message })
        };
    }
};

