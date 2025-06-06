import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (fileBuffer) => {
  try {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:application/pdf;base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'resumes',
      resource_type: 'raw',
      format: 'pdf'
    });

    console.log('Cloudinary upload result:', result);
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};