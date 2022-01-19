class ExpressError extends Error {
   constructor(msg, statusCode, name) {
      super();
      this.name = name;
      this.message = msg;
      this.statusCode = statusCode;
   }
   //addMethodsHere(){...}
}

module.exports = ExpressError;