module.exports = function (schema, options, ...vals) {
   console.log('CUSTOM PLUGIN EXAMPLE - Must export a function which is called when file gets required()');
   console.log('OPTIONS', options);
   console.log('ADDITIONAL VALUES', vals);
   console.log('METHODS', schema.methods);
   console.log('STATICS', schema.statics);
   console.log('VIRTUALS', schema.virtuals);
   console.log('PATHS', schema.paths);

}