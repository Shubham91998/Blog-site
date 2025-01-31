

require("dotenv").config(); 
const cloudinary = require('cloudinary').v2;
const fs = require("fs");
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically determine the resource type
        });

        // Log the successful upload
        //console.log("File uploaded to Cloudinary:", response.url);

        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);
        
        // Return the URL of the uploaded file
        return response.url; // Return only the URL if needed
    } catch (error) {
        //console.error("Error uploading to Cloudinary:", error);
        
        // Delete the local file if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return null; // Return null on error
    }
};

module.exports = {uploadOnCloudinary};

