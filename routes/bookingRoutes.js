const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

router.use(authController.protected)
router.get('/checkout/:tourID', bookingController.getSession);
router.use(authController.permission('admin', 'lead-guide'));
router.route('/') 
.get(bookingController.getAllBookings)
.post(bookingController.newBooking);
router.route('/:id')
.get(bookingController.getBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking);

module.exports = router;