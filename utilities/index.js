const { Campground, Review } = require('../models');
const axios = require('axios');


module.exports.ExpressError = require('./ExpressError');

module.exports.validateReview = require('./validateReview');
module.exports.validateCampground = require('./validateCampground');
module.exports.validateUser = require('./validateUser');

/**
 * Error handler for async code.
 * It returns a function with the original code embedded in @fn and adds-on a .catch()
 * This prevents the need to wrap try...catch around every rout 
 */
module.exports.catchAsync = function catchAsync(fn) {
   return function (req, res, next) {
      fn(req, res).catch(e => next(e));
   };
};

module.exports.clearReturnTo = (req, res, next) => {
   console.log('UTILITIES CLEARING RETURNTO');
   if (req.session.returnTo) delete req.session.returnTo;
   next();
};

module.exports.isAuthenticated = function isAuthenticated(req, res, next) {
   if (!req.isAuthenticated()) {

      req.flash('message', { alert: 'warning', msg: 'You Must Be Logged-in To access This Resource' });

      req.path !== '/logout' && (req.session.returnTo = req.originalUrl); //stores the requested url in the session which is used for redirecting later after login
      console.log('ISAUTHENTICATED.js - REQ.SESSION.RETURNTO :', req.session.returnTo);
      return res.redirect('/login');
   }

   next();
};

module.exports.isAuthorised = async function isAuthorised(req, res, next) {
   const { id } = req.params;
   const camp = await Campground.findById(id);

   if (!camp) {       // throw new ExpressError('Campground Not Found', 500);
      req.flash('message', { alert: 'danger', msg: 'Campsite Not Found!' });
      return res.redirect('/campgrounds');
   }

   if (!camp.author.equals(req.user._id)) {
      req.flash('message', { alert: 'danger', msg: 'You Do Not Have Permission!' });
      return res.redirect(`/campgrounds/${id}`);
   };

   next();
};

module.exports.isReviewAuthor = async function (req, res, next) {
   const { id, reviewId } = req.params;
   const review = await Review.findById(reviewId);

   if (!review) {       // throw new ExpressError('Review Not Found', 500);
      req.flash('message', { alert: 'danger', msg: 'Review Not Found!' });
      return res.redirect(`/campgrounds/${id}`);
   }

   if (!review.author.equals(req.user._id)) {
      req.flash('message', { alert: 'danger', msg: 'You Do Not Have Permission!' });
      return res.redirect(`/campgrounds/${id}`);
   };

   next();
};

module.exports.geocode = async function (location, options = {}) {
   /**  options
    * {
    * sun_module: 0,
    * timezone_module: 0,
    * country_module: 0,
    * bbox_module: 0,
    * }
    * */
   const res = await axios.get('http://api.positionstack.com/v1/forward',
      {
         params: {
            access_key: process.env.POSITIONSTACK_KEY,
            query: location,
            ...options
         }
      });
   console.log(location);
   return res.data.data;
};