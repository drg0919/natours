const express = require('express');
const router = express.Router();
const {getAllTours,newTour,getTour,updateTour,deleteTour,checkBody,topFive,getTourStats,getToursWithin,uploadPhotos,resizePhotos} = require('../controllers/tourController');
const auth = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// router.param('id',checkId);
// router.route('/tour-stats').get(getTourStats);

router.route('/')
.get(getAllTours)
.post(auth.protected, auth.permission('admin','lead-guide'),newTour);

router.route('/top-5')
.get(topFive,getAllTours);

router.route('/:id')
.get(getTour)
.patch(auth.protected, auth.permission('admin','lead-guide'), uploadPhotos, resizePhotos, updateTour)
.delete(auth.protected, auth.permission('admin','lead-guide'),deleteTour);

router.route('/tours-within/:distance/center/:latlong/unit/:unit')
.get(getToursWithin);

//router.route('/:id/reviews').post(auth.protected,auth.permission('user'),newReview)
router.use('/:id/reviews', reviewRouter);
module.exports = router;