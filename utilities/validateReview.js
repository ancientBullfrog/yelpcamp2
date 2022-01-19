const { review } = require('./joiSchemas');
const ExpressError = require('./ExpressError');

function validateReview(req, res, next) {
   const { error } = review.validate(req.body);
   if (error) {
      const msg = error.details.map(el => {
         return `${el.message} value received '${el.context.value}'.`;
      }).join(', ');
      throw new ExpressError(msg, 400, 'Joi Error');
   }
   next();
};

module.exports = validateReview;