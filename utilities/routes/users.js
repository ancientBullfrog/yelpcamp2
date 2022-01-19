const express = require('express');
const { validateUser, isAuthenticated, clearReturnTo } = require('../utilities');
const { renderRegisterForm, registerUser, renderLoginForm, loginUser, logoutUser, renderiForgotForm, findAndEmail, renderResetForm, resetPasswordAndLogin } = require('../controllers/users');
const passport = require('passport');
const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();


router.route('/login')
   .get(renderLoginForm)
   .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
      loginUser
   );

/**
 * clear req.session.returnTo incase user navigates away without logging in
 * - the login route must be seperated from this otherwise it will not redirect back to returnTo
 */
router.use(clearReturnTo);

router.route('/register/new')
   .get(renderRegisterForm)
   .put(validateUser, registerUser);


router.get('/logout', isAuthenticated, logoutUser);

/** generate a token to allow pw change
 * send email
 * move to controller
 */
router.get('/forgot', renderiForgotForm);
router.post('/forgot', findAndEmail);

router.route('/reset/:token')
   .get(renderResetForm)
   .post(resetPasswordAndLogin);

/** the logged in user will be in session locals
 * username
 * email
 * _id
 * 
 * _id needs to be in url for collection by client script
 */
router.route('/user/:userId')
   .get(async (req, res) => {
      const { userId } = req.params;
      res.render('auth/userAccount');
   });

router.route('/user/password/:userId')
   .post(async (req, res) => {
      try {
         const { userId } = req.params;
         console.log('req.params.userId', req.params);
         console.log('req.body.userId', req.body);
         const { oldPassword, newPassword } = req.body.user;
         const user = await User.findById(req.params.userId);
         await user.changePassword(oldPassword, newPassword);
         res.json({ update: true });
      } catch (err) {
         res.json({ ...err });
      }
   });

module.exports = router;