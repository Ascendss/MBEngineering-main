const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const postsFilePath = 'content/posts.json';

    try {
        const { id } = JSON.parse(event.body);
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Post ID is required' }) };
        }

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
            if (error.status === 404) {
                return { statusCode: 404, body: JSON.stringify({ error: 'No posts found to delete from.' }) };
            }
            throw error;
        }

        const postToDelete = posts.find(p => p.id === id);
        const updatedPosts = posts.filter(p => p.id !== id);

        if (posts.length === updatedPosts.length) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Post not found' }) };
        }

        if (postToDelete && postToDelete.image) {
            try {
                const imagePath = postToDelete.image.startsWith('/') 
                    ? postToDelete.image.substring(1) 
                    : postToDelete.image;

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
                    message: `feat: Delete post image ${imagePath}`,
                    sha: imageFile.sha,
                    branch: 'main'
                });
            } catch (error) {
                if (error.status !== 404) {
                    console.error("Failed to delete post image, but proceeding.", error);
                }
            }
        }

        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            path: postsFilePath,
            message: `feat: Delete post ${postToDelete.title}`,
            content: Buffer.from(JSON.stringify(updatedPosts, null, 2)).toString('base64'),
            branch: 'main',
            sha: existingFileSha
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Post deleted successfully' })
        };

    } catch (error) {
        console.error('Delete post error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete post.', details: error.message })
        };
    }
}; 
