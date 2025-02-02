import {v2 as cloudinary} from 'cloudinary';
const tempFilePath = process.env.TEMP_FILE_PATH;

export const uploadImage = async (file, folder, height, width, quality) => {
    try {
        const options = {folder};
        if(height) {
            options.height = height;
        }
        if(width) {
            options.width = width;
        }
        if(quality) {
            options.quality = quality;
        }
        options.resource_type = "auto";

        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        
        return result;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Image upload failed");
    }
}
