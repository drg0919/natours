const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const bookingController = require('../controllers/bookingController');
const {isLoggedIn,protected} = require('../controllers/authController');

router.get('/', isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', isLoggedIn, viewController.getTour);
router.get('/login', isLoggedIn, viewController.login);
router.get('/me', protected, viewController.getAccount);
router.get('/my-tours', protected, viewController.getMyTours);

module.exports = router;