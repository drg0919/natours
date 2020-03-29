const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

exports.getTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if(!tour) {
        return next(new AppError('No such tour found',404));
    }
    res.status(200).render('tour', {
        tour
    });
});

exports.getOverview = catchAsync(async (req,res,next) => {
    const tours = await Tour.find();
    if(!tours) {
        return next(new AppError('No tours available at the moment',404));
    }
    res.render('overview', {
        tours
    });
});

exports.login = (req,res,next) => {
    res.status(200).render('login');
}

exports.getAccount = (req,res,next) => {
    res.status(200).render('account', {
        title: 'Your account',
        user: req.user
    });
}

exports.getMyTours = catchAsync(async (req,res,next) => {
    const bookings = await Booking.find({user: req.user.id});
    const ids = bookings.map(ele => ele.tour);
    const tours = await Tour.find({_id: {$in: ids}});
    res.status(200).render('overview', {
        tours
    })
});