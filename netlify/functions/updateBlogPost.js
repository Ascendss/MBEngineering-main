exports.handler = async function(event) {
    if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
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
        const updatedPost = JSON.parse(event.body || '{}');
        
        if (!updatedPost.id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Blog post ID is required for updates.' })
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

        // Find and update the post
        const postIndex = posts.findIndex(p => p.id === updatedPost.id);
        if (postIndex === -1) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Blog post not found.' })
            };
        }

        // Merge updates with existing post
        posts[postIndex] = {
            ...posts[postIndex],
            title: updatedPost.title || posts[postIndex].title,
            summary: updatedPost.summary !== undefined ? updatedPost.summary : posts[postIndex].summary,
            heroImage: updatedPost.heroImage || updatedPost.imageUrl || posts[postIndex].heroImage,
            content: updatedPost.content !== undefined ? updatedPost.content : posts[postIndex].content,
            updatedAt: new Date().toISOString()
        };

        // Save updated posts
        const putUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${blogFilePath}`;
        const putBody = {
            message: `feat: Update blog post "${posts[postIndex].title}"`,
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
            body: JSON.stringify(posts[postIndex])
        };

    } catch (error) {
        console.error('Update blog post error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update blog post.', details: error.message })
        };
    }
};

