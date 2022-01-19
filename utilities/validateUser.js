const { user } = require('./joiSchemas');
const ExpressError = require('./ExpressError');

function validateUser(req, res, next) {
   const { error } = user.validate(req.body); // call Joi validate function
   if (error) {
      console.log('VALIDATE-USER.js ERROR!', req.body);
      const msg = error.details.map(el => {
         return `${el.message} value received '${el.context.value}'.`;
      }).join(', ');
      throw new ExpressError(msg, 400, 'Joi Error');
   }
   next();
};

module.exports = validateUser;