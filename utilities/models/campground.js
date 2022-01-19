const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const { cloudinary } = require('../cloudinary');

/**
 * Defining the image schema seperately allows properties like virtuals to be set on nested object -
 * -in particular an array or objects
 * The schema doesnt need to be turned into a model - just referenced from the 'parent' schema
 */
const ImageSchema = new Schema({
   url: String,
   filename: String
});

/**
 * url is a string so use string methods to update url and save to thumbnail
 * This might be expensive on cloudinary - counts as a transformation vs creating thumbnails to begin with
 * and storing those.
 * 
 * Can use css to resize the image but if uploaded image is large there will be a performance hit
 *  - limit file size upload / process file size reduction on server before upload to cloud? 
 *  - see multer  docs for info on handling files before uploading them. 
 *  - 1000 transformations = 1 credit however 1 credit = 1gb bandwidth so 1000 requests 
 *    -for a thumbnail at 0.2mb = 200mb = 0.2 credits  
 * 
 * In summary use a package to optimise files before uploading using muler filehandling function
 *  - The transformation costs more than storing it as a thumbnail in the first place
 */
ImageSchema.virtual('thumbnail').get(function () {
   return this.url.replace('/upload', '/upload/w_200');
});

const GeometrySchema = new Schema({
   type: {
      type: String,
      enum: ['Point'],
      required: true
   },
   coordinates: {
      type: [Number],
      required: true
   }
});
/**
 * virtuals are not passed to JSON by default -
 * -if JSON.stringify() should include virtual properties use this setting
 *  - https://mongoosejs.com/docs/tutorials/virtuals.html
 */
const options = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
   title: String,
   images: [ImageSchema],
   geometry: {
      type: GeometrySchema,
      index: '2dsphere'
   },
   price: Number,
   description: String,
   location: String,
   author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   reviews: [
      {
         type: Schema.Types.ObjectId,
         ref: 'Review'
      }
   ]
}, options);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
   return `
   <h4>${this.title}</h4>
   <a href="/campgrounds/${this._id}">
   <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
   </svg>LINK</a>`;
});


// when camp deleted find and delete all associated reviews
CampgroundSchema.post('findOneAndDelete', async function (doc) {
   console.log('Mongoose Campground Post findOneAndDelete Hook - Deleted Camp :', doc.title);
   if (doc) {
      const status = await Review.deleteMany({ _id: { $in: doc.reviews } });
      console.log('Mongoose Campground Post findOneAndDelete Hook - Deleted Reviews : ', status);
      //delete images from coludinary
      if (doc.images) {
         console.log('Mongoose Campground Post findOneAndDelete Hook - Deleted Images From Cloudinary');
         for (let image of doc.images) {
            console.log({ filename: image.filename });
            cloudinary.uploader.destroy(image.filename); //check docs to see whats returned
         }
      }
   }
});

module.exports = mongoose.model('Campground', CampgroundSchema);