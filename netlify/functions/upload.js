const fs = require('fs').promises;
const path = require('path');
const formidable = require('formidable');

exports.handler = async function(event, context) {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        // Parse the multipart form data
        const form = new formidable.IncomingForm();
        
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(event, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        const file = files.file;
        if (!file) {
            throw new Error('No file uploaded');
        }

        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../assets/uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name;
        const extension = path.extname(originalName);
        const filename = `${timestamp}${extension}`;
        
        // Copy file to uploads directory
        await fs.copyFile(file.path, path.join(uploadsDir, filename));
        
        // Clean up temp file
        await fs.unlink(file.path);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: `/assets/uploads/${filename}`
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