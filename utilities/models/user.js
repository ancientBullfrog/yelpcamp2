const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//PLM provides some helper functions to use auth with passport and fields on the schema
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
   email: {
      type: String,
      required: true,
      unique: true //sets the field to be  unique index - however the docs say this should be done in production in the DB shell
   },
   passwordResetToken: String,
   passwordResetExpires: Date
});

// adds in code form other files - in this case a username, hash and salts field along with some static methods
UserSchema.plugin(passportLocalMongoose);

// /** 
//  * Creating plugins is similar to requiring other .js files with require() - like a file of utility functions.
//  * The plugin MUST be a function which, when 'plugged-in' will execute - During execution the schema and 'options' are passed,
//  *   OPTIONS can be any type (object, array etc)
//  * 
//  * To add to the schema become as simple as writing the code in the original schema file provided they are plugged in before moddeling.
//  * schema.statics.myFunc = function(){...}
//  * schema.pre('save', function(){...})
//  * 
//  * To add paths to a schema use the schema.add({...}) function where the object passed in is a list of schemaPath types
//  * schema.add({name: {type: String}, age: Number})
//  * 
//  */
// const plugin_example = require('./plugin_example');
// UserSchema.plugin(plugin_example, 'additional parameter - can be ANY type');

module.exports = mongoose.model('User', UserSchema);