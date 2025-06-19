const fs = require('fs').promises;
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Path to the uploads directory relative to the function
    const uploadsDir = path.join(__dirname, '../../assets/uploads');
    
    // Read the contents of the uploads directory
    const files = await fs.readdir(uploadsDir);
    
    // Filter for image files and create project objects
    const projects = files
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => ({
        id: file.replace(/\.[^/.]+$/, ""), // Remove extension
        title: file.replace(/\.[^/.]+$/, "").replace(/-/g, " "), // Remove extension and replace dashes with spaces
        description: "Project description", // You can store descriptions in a separate metadata file if needed
        image: `/assets/uploads/${file}`
      }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Add CORS headers if needed
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(projects)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to load projects',
        details: error.message 
      })
    };
  }
}
