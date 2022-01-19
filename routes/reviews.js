const express = require('express');
const { validateReview, isAuthenticated, isReviewAuthor, clearReturnTo } = require('../utilities');
const { addReview, deleteReview } = require('../controllers/reviews');
//mergeParams sends the parameters from the 'parent' route in index.js to this router
const router = express.Router({ mergeParams: true });

//REVIEWS

/**
 * clear req.session.returnTo incase user navigates away without logging in
 * clears returnTo after login
 */
router.use(clearReturnTo);

// '/campgrounds/:id/review'
router.put('/', isAuthenticated, validateReview, addReview);
// delete review
router.delete('/:reviewId', isAuthenticated, isReviewAuthor, deleteReview);

module.exports = router;