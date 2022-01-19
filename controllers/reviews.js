const { catchAsync } = require('../utilities');
const { Review, Campground } = require('../models');

module.exports.addReview = catchAsync(async (req, res) => {
   const { id } = req.params;
   const review = new Review(req.body.review);
   review.date = Date.now();
   review.author = req.user._id;

   const campground = await Campground.findById(id);
   if (!campground) {
      req.flash('message', {
         alert: 'danger', //'danger' for bootstrap
         msg: 'Campsite Not Found!'
      });
      return res.redirect('/camgrounds');
   };
   campground.reviews.push(review);
   // calls both async ops together and waits for both to finish
   await Promise.all([campground.save(), review.save()]);

   req.flash('message', {
      alert: 'success', //'danger' for bootstrap
      msg: 'Successfully Created Your Review!'
   });

   res.redirect(`/campgrounds/${id}`);
});

module.exports.deleteReview = catchAsync(async (req, res) => {
   const { id, reviewId } = req.params;
   let result = await Promise.all([
      Review.findByIdAndDelete(reviewId),
      Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
   ]);
   // stops route running to search for missing camp - saves a db call
   console.log('REVIEW.js - PROMISE.ALL RESULT', result);
   if (result[1] === null) {
      req.flash('message', {
         alert: 'danger', //'danger' for bootstrap
         msg: 'Campsite Not Found!'
      });
      return res.redirect('/campgrounds');
   }
   //this runs even if review already deleted
   req.flash('message', {
      alert: 'warning', //'danger' for bootstrap
      msg: 'Your Review Has Been Deleted!'
   });

   res.redirect(`/campgrounds/${id}`);
});