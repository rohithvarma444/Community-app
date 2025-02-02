import {v2 as cloudinary} from 'cloudinary';
const tempFilePath = "video_uploads";

export const videoUploader = async (file, folder) => {
    const options = {folder};

    options.resource_type = "video";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}