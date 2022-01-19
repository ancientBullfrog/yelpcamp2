const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Likely sensible to add author.name here aswell link to user profile to reduce lookups
 * Remember to update when user profile updates
 * index on author._id to assist with name updates
 */
const ReviewSchema = new Schema({
   author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   rating: Number,
   body: String,
   date: String,
   comments: {
      type: [Schema.Types.ObjectId],
      ref: 'Review'
   }
});

// ReviewSchema.post('findOne', (doc) => {
//    console.log('findOne:', doc);
// });

// ReviewSchema.post('find', (doc) => {
//    console.log('find:', doc);
// });

module.exports = mongoose.model('Review', ReviewSchema);