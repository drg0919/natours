const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const {isLoggedIn,protected} = require('../controllers/authController');

router.get('/', isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', isLoggedIn, viewController.getTour);
router.get('/login', isLoggedIn, viewController.login);
router.get('/me', protected, viewController.getAccount);
router.get('/my-tours', protected, isLoggedIn, viewController.getMyTours);

module.exports = router;