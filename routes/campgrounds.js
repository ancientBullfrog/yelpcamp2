const express = require('express');
const { validateCampground, isAuthenticated, isAuthorised, clearReturnTo } = require('../utilities');
const {
	showCampground,
	renderNewForm,
	createCampground,
	renderEditForm,
	patchCampground,
	deleteCampground,
	showAllCampgrounds,
	showAllCampgroundsPage,
	getNearCampgrounds
} = require('../controllers/campgrounds');
const router = express.Router();

/**
 * To process form data containing file uploads the form needs the encoding type changed to multipart/form-data
 * by default express only handles urlEncoded forms - app.use(express.urlEncoded({extended:true}))
 * MULTER encodes file uploads AND form data. It only be used on the route handler as middleware - see warning in docs
 * - req.file : holds singular file details via upload.single('field-name from form')
 * - req.files : [ holds an array of files via upload.array('field-name' from form, [max-count])]
 * 
 * Multer can be used with a further package to make uploading easier
 */
function fileFilter(req, file, cb) {
	console.log('CAMPGROUND ROUTE.js MULTER - FUNCTION TO ALLOW OR REJECT FILES', file);
	//the cloudinary storage object takes an array of allowed types although the same check here can filter out bad files and not break
	if (![ 'image/png', 'image/jpeg', 'image/jpg' ].includes(file.mimetype)) {
		//flash back to new
		return cb(new Error('Upload only Image of type jpg/jpeg or png'), false);
	}
	cb(null, true);
}

const multer = require('multer');
const { storage } = require('../cloudinary');
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: storage, fileFilter: fileFilter });

/**
 * clear req.session.returnTo incase user navigates away without logging in
 */
router.use(clearReturnTo);

/**
 * router.route allows the routs with the same path to be cahined together as below
 * Beneth those are the original equivelent singular methods
 */
router.get('/', showAllCampgrounds);

router
	.route('/new')
	.get(isAuthenticated, renderNewForm)
	/** 
    * Currently the images are uploaded before anything is validated!!
    * - this means the images upload and the camp could still fail
    * - - this could create orphaned images on cloudinary as they will not map to the campsite (which isnt created!)
    * */
	.put(isAuthenticated, upload.array('campground[image]'), validateCampground, createCampground);

/** this is a test route for geo $near functionality and paging
 * if not required remove references on this page and controller
 */
router.route('/geolocate').get(getNearCampgrounds);

router.get('/all/:page', showAllCampgroundsPage); // this will break the details page lookup
router
	.route('/:id')
	.get(showCampground)
	.patch(isAuthenticated, isAuthorised, upload.array('campground[image]'), validateCampground, patchCampground)
	.delete(isAuthenticated, isAuthorised, deleteCampground);

router.get('/:id/edit', isAuthenticated, isAuthorised, renderEditForm);

// //show ALL/filtered campgrounds
// router.get('/', showAllCampgrounds);
// //show new campground form
// router.get('/new', isAuthenticated, renderNewForm);
// //create new campground
// router.put('/new', isAuthenticated, validateCampground, createCampground);
// //show campground details
// router.get('/:id', showCampground);
// //show campground edit form - client js to show form on details page and save a further call to DB??
// router.get('/:id/edit', isAuthenticated, isAuthorised, renderEditForm);
// //update campground
// router.patch('/:id', isAuthenticated, isAuthorised, validateCampground, patchCampground);
// // delete campground
// router.delete('/:id', isAuthenticated, isAuthorised, deleteCampground);

module.exports = router;
