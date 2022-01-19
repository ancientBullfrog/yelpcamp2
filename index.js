/**
 * dotenv is a package which setup the environment variable for a development environment
 * It reads from a application root level '.env' file containing key:value pairs which-
 * -are added to process.env
 * 
 * Note in production mode the evn variables are configured on the environment before the app runs 
 */
if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const { helmet, csp } = require('./utilities/helmet');

const MongoDBStore = require('connect-mongo');
// PASSPORT
const User = require('./models/user'); //required for access to passport-local-mongoose methods
const passport = require('passport');
const LocalStrategy = require('passport-local');

const { ExpressError } = require('./utilities');
const { campgroundRoutes, reviewRoutes, userRoutes } = require('./routes');

/**
 * connect to mongoose
 * atlas 
 * mongodb+srv://test-user:<password>@cluster0.kxfta.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
 * mongodb://localhost:27017/yelpcamp
 */
// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
   useCreateIndex: true
})
   .then((res) => console.log("CONNECTED TO MONGODB:", res.connections[0].port))
   .catch((err) => console.log('MONGO CONNECTION ERROR:', err));

const app = express();
const port = process.env.PORT || process.argv[2] || 3000;

// //setup engine to use for ejs files - if not set a default engine is used
app.engine('ejs', ejsMate);
// //setup path to views and default extention - 'path' is not necessary for this op but will provide other benefite
app.set('views', path.join(__dirname, 'views'));
// //sets the default extention to use and calls require('ejs')
app.set('view engine', 'ejs');

// //setup static files, method override and form data decoder, express.json() will read json sent to api
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const secret = process.env.SECRET || 'thisisnotagoodsecret';
const store = MongoDBStore.create({
   mongoUrl: dbUrl,
   touchAfter: 60 * 60 * 24,
   secret
});
const sessionOptions = {
   secret,
   resave: false,
   saveUninitialized: false, //check 487 - this was set to true, docs recommentd false
   cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 1,
      httpOnly: true, //hides session cookies from xss js
      // secure: true //only works over https
   },
   name: 'setUniqueCookieName', //makes it harder to extract the session cookie by script xss and steal the session
   store
};

//session and flash message - declaring here enables use in router routes
app.use(session(sessionOptions));
app.use(flash());

/** SECURITY FEATURES
 * sanitise incoming user data - removes keys with '$' and '.' from req.query .body and .params
 * - use as early as possible
 * - helps to prevent mongo injection attacks
 * 
 * Can try to make a custom package for this?
 * for the incoming req check .query .body and .params for keys starting with illegal characters
 * if found delete key 
 *  - config additional characters with an array of characters
 */
//
app.use(mongoSanitize({
   replaceWith: 'HACKED'
}));
/** 
 * HELMET - SECURITY MIDDLEWARE
 * Adds several middleware functions to manipulate and add headers
 * https://github.com/helmetjs/helmet
 */
app.use(helmet());
app.use(csp);

// //PASSPORT
// //auth setup - passport
app.use(passport.initialize());
app.use(passport.session()); // must be used AFTER express-session() - required to persist sessions
// /** 
//  * @User.authenticate() is a function added to the user model by passport-local-mongoose
//  * - all it needs to be is a callback to varify a user
//  * 
//  * -- see auth in documents for a breakdown of the structure
//  */
passport.use(new LocalStrategy(User.authenticate()));
// /**
//  * For sessions usage, CB come from passport-local-mongoose
//  */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//**************************************************************** */
// // setup global res.locals for messaging
app.use((req, res, next) => {

   res.locals.message = req.flash('message');
   res.locals.error = req.flash('error'); // if this is not flashed here it is not removed from the session
   res.locals.user = req.user;
   console.log('REQ.SESSION', req.session);
   console.log('REQ.QUERY', req.query);
   console.log('REQ.BODY', req.body);
   console.log('REQ.PARAMS', req.params);
   next();
});

// //router
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


// // home page
app.get('/', async (req, res) => {
   res.render('home');
});

// //404
// //app.use also works as it is called on every request and can be mounted to a path -lesson 442
// // app.all('*') seems more appropriate to routes
app.all('*', (req, res, next) => {
   next(new ExpressError(`Page Not Found ${req.originalUrl} method ${req.method}`, 404));
});

// //Error handlers
// // to move to own file setup up custom 'errorHandler.js' middleware
// // improve Error class to handle more info / find various error codes from mongoose/express/ejs (might need to be custom)
// // ultimately move flashing to errorHandler.js

app.use((err, req, res, next) => {
   console.log('ERROR HANDLER!!!', err);
   const { statusCode = 500 } = err;
   if (!err.message) err.message = 'Oh No, Something Went Wrong!';
   res.status(statusCode).render('error', { err });
});

// //start server
app.listen(port, () => console.log('LISTENING ON PORT:', port));