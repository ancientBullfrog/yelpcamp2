const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

/**
 * lookup Joi extentions - 563
 * https://joi.dev/api/?v=17.4.2#extensions
 */
const extension = (joi) => ({
   type: 'string',
   base: joi.string(),
   messages: {
      'string.escapeHTML': '{{#label}} must not include HTML!'
   },
   rules: {
      escapeHTML: {
         validate(value, helpers) {
            const clean = sanitizeHTML(value, {
               allowedTags: [],
               allowedAttributes: {},
            });
            if (clean !== value) return helpers.error('string.escapeHTML', { value });
            return clean;
         }
      }
   }
});

const Joi = BaseJoi.extend(extension);

module.exports.campground = Joi.object({
   campground: Joi.object({
      title: Joi.string().required().escapeHTML(),
      price: Joi.number().required().min(0),
      description: Joi.string().required().escapeHTML(),
      image: Joi.array().items(
         Joi.object({
            url: Joi.string().required(), //update to check url format
            filename: Joi.string().required() // check for allowed types? - this is also an option via multer storage object
         })
      ),
      location: Joi.string().required().escapeHTML()
   }).required(),
   deleteImg: Joi.array()
});

module.exports.review = Joi.object({
   review: Joi.object({
      rating: Joi.number().required().min(1).max(5),
      body: Joi.string().required().min(8).escapeHTML(),
   }).required()
});

module.exports.user = Joi.object({
   user: Joi.object({
      username: Joi.string().required().escapeHTML(),
      email: Joi.string().required().email({ minDomainSegments: 2 }),
      password: Joi.string().required().escapeHTML()
   }).required()
});



//The joi schemas represent the object being passed for validation. When the object is passed it will be vlaidated as per the definitions
//however if the object is not .required() and is not supplied it will not try to validate 
// pass a body object, review and body are validated.
// do not pass a body, review{} is not required so all is good!! :\