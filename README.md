# yelpcamp2
Update to original functionality from the Web Development Bootcamp

Demo site available here; https://mywifemademejoin-yelpcamp2.herokuapp.com/ - the initial hit could take up to 30 seconds to load if the app is 'sleeping'.

Original functionality used CRUD to manage campsite data and introduced various third party software such as Cloudinary and Mapbox.

This version adds a few features to the base YelpCamp created in the course. These features are as follows:
- Added Search to home page
- Added search to map
- Added basic user profile where passsword can be updated
- Added forgot password with email reset link via node mailer
- Added pagination to index page
- Changed review model to allow comments on reviews

Current issues are:
- Using geo-location search input on the map does not update the list of campsites
- Campsites on map are restricted to current pageination page.
- Anything else I haven't found yet
- It's really, really ugly; except for the home page.
- Not tested on mobile
- No UI for comments on reviews.
