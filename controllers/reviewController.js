const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setNewReviewData = (req,res,next) => {
    const data = {
        review: req.body.review,
        rating: req.body.rating,
        user: req.body.user,
        tour: req.body.tour
    };
    if (!data.tour) {
        data.tour = req.params.id
    }
    if (!data.user) {
        data.user = req.user.id;
    }
    req.body = data;
    next();
}

exports.getAllReviewsOfTour = catchAsync(async (req,res,next) => {
    if(!req.params.id) {
        return next(new AppError('No such tour\'s reviews found',404));
    }
    const reviews = await Review.find({tour: req.params.id});
    // .populate({
    //     path: 'tour',
    //     select: 'name'
    // }) Can be added
    res.status(200).json({
        status: 'success',
        data: {
            reviews
        }
    });
})

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review,{path: 'tour',select: 'name'});
exports.newReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);