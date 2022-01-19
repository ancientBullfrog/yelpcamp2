const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * Associates Cloudinary credentials with this Cloudinary API object 
 *  - assuming require() returns a new cloudinary instance for which config() is a method
 *  - check cloudinary docs for config()
 * 
 * https://cloudinary.com/documentation/node_integration#installation_and_setup
 */
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_KEY,
   api_secret: process.env.CLOUDINARY_SECRET
});

/**
 * Creates a cloudinary storage object which is passed to multer as its @storage parameter
 *  - @cloudinary : instance of cloudinary with credentials configured
 *  - @folder : where to upload on cloudinary
 *  - @allowedFormats : allowed file formats
 */
module.exports.storage = new CloudinaryStorage({
   cloudinary,
   params: {
      folder: 'yelpcamp',
      allowed_formats: ['jpeg', 'png', 'jpg'],
      width: 1024,
      crop: 'fill',
      // quality: 'auto:good',
   }
});

module.exports.cloudinary = cloudinary;