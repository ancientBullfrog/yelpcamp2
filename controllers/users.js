const { catchAsync } = require('../utilities');
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

module.exports.renderRegisterForm = (req, res) => {
	res.render('auth/new');
};

module.exports.registerUser = catchAsync(async (req, res) => {
	const { username, password, email } = req.body.user;
	// create a user instance
	const user = new User({ email, username });
	// creates the password hash and stores in DB - works like the User.pre('save') hook to update the password
	// inserts the user into the DB
	const registeredUser = await User.register(user, password);
	req.login(registeredUser, err => {
		if (err) next(err);
	}); //passport method is not async so use callback - required
	req.flash('message', {
		alert : 'success',
		msg   : 'Welcome To YelpCamp'
	});
	res.redirect('/campgrounds/all/1');
	console.log('USER CREATED WITH ID', user._id);
});

module.exports.loginUser = (req, res) => {
	console.log('LOGIN USERS.js', req.body);
	const url = req.session.returnTo || '/campgrounds/all/1';
	delete req.session.returnTo;

	req.flash('message', {
		alert : 'success',
		msg   : 'Welcome Back!'
	});

	console.log('REQ.USER', req.user);
	res.redirect(url);
};
module.exports.logoutUser = (req, res) => {
	req.logout();

	req.flash('message', {
		alert : 'info',
		msg   : 'You have Been Logged Out'
	});

	req.session.destroy();

	res.redirect('/campgrounds/all/1');
};

module.exports.renderLoginForm = (req, res) => {
	res.render('auth/login');
};

module.exports.renderiForgotForm = (req, res) => {
	res.render('auth/iforgot');
};

module.exports.findAndEmail = catchAsync(async (req, res) => {
	/**
    * NEED TO VALIDATE DATA ON SERVER
    * - check input is a valid email with joi
    * 
    * - TEST
    * use postman to send mongo injection to adjust a different username
    * token would be saved against different user whos account could be stollen
    */
	const { email } = req.body.user;
	// validate email
	const buff = await crypto.randomBytes(20);
	const token = buff.toString('hex');
	/** find a user based on form email input 
    * add token and expiry(date) date to user
    * save user
    * check plm added fields 
    */

	/** add sanitising to @email 
    * attempts to inject appear to fail
    *  - the form used sets the key to email so regardless of the value it will always look in email
    *    - further an email will not get sent as address will be rejected
    *   - validate with Joi anyway??
    *    - would be able to throw out junk queries before runnin the db code
    */
	console.log('QUERY', email, token);
	const user = await User.findOneAndUpdate(
		{ email },
		{
			passwordResetToken   : token,
			passwordResetExpires : Date.now() + 1000 * 60 * 5
		},
		{ new: true }
	);

	if (!user) return res.send('if a user with the email you have entered exists they will be sent an email shortly');
	console.log(user);

	// send an email
	const smtpTransport = nodemailer.createTransport({
		host : 'smtp.office365.com',
		port : 587,
		auth : {
			user : 'hello@sinesquared.co.uk',
			pass : process.env.EMPW
		}
	});
	const mailOptions = {
		to      : email,
		from    : 'hello@sinesquared.co.uk',
		subject : 'Password Reset Request',
		text    : `You are receiving this email because you have requested a password reset.
      
      Click the link or paste it into your browser to reset your password
      http://${req.headers.host}/reset/${token}
      
      This link will expire in 5 minutes.`
	};
	const sent = await smtpTransport.sendMail(mailOptions);
	if (!sent) return res.send('there was an error');
	res.send(user);
});

module.exports.renderResetForm = catchAsync(async (req, res) => {
	const { token: passwordResetToken } = req.params;
	//without validating param as a token this can be a string to inject to the db
	const user = await User.findOne({ passwordResetToken });
	if (user.passwordResetExpires < Date.now()) return res.send('Your link has expired');
	res.render('auth/reset', { passwordResetToken });
});

module.exports.resetPasswordAndLogin = catchAsync(async (req, res) => {
	const { token: passwordResetToken } = req.params;
	const { newPassword } = req.body.user;

	console.log('query', { passwordResetToken });
	const user = await User.findOne({ passwordResetToken });
	console.log('user', user);
	await user.setPassword(newPassword);
	console.log('setting password on ', user, user.hash);
	// clear password token and expiry date
	user.passwordResetExpires = null;
	user.passwordResetToken - null;
	await user.save();

	req.login(user, err => {
		if (err) next(err);
	});

	res.redirect('/campgrounds/all/1');
});
