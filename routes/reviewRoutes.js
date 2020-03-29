const express = require('express');
const router = express.Router({mergeParams: true});
const {newReview,getReview,getAllReviews,updateReview,setNewReviewData,deleteReview} = require('../controllers/reviewController');
const {protected,permission} = require('../controllers/authController');

router.use(protected);

router.route('/:id')
.get(getReview)
.patch(permission('user','admin'), updateReview)
.delete(permission('user','admin'), deleteReview);

router.route('/')
.post(permission('user'), setNewReviewData, newReview)
.get(getAllReviews);

module.exports = router;