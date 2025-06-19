const { createHash } = require('crypto');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Parse the base64 file content from the request body
        const { filename, content, contentType } = JSON.parse(event.body);
        
        if (!filename || !content) {
            throw new Error('Filename and content are required');
        }

        // Remove the base64 prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = content.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        
        // Create a unique filename
        const fileExtension = path.extname(filename);
        const timestamp = Date.now();
        const hash = createHash('md5').update(base64Data).digest('hex').substring(0, 6);
        const newFilename = `${timestamp}-${hash}${fileExtension}`;
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../assets/uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        // Write the file
        const filePath = path.join(uploadsDir, newFilename);
        await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: `/assets/uploads/${newFilename}`
            })
        };
    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to upload file',
                details: error.message
            })
        };
    }
}; 