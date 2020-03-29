const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review : {
        type: String,
        trim: true
    },
    rating : {
        type: Number,
        required: [true, 'Review must have a rating'],
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review belongs to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review belongs to a user']
    }
},
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

reviewSchema.index({
    user: 1,
    tour: 1
}, {
    unique: true
});

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    // .populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    next();
});

reviewSchema.statics.averageRatings = async function(tourId) {
    const stats = await this.aggregate([       //this refers to currnt model
        {
            $match : {
                tour: tourId
            }
        },
        {
            $group : {
                _id : '$tour',
                numOfRatings : {$sum : 1 },
                avgRating : {$avg : '$rating' }
            }
        }
    ]);
    if(stats.length>0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage : stats[0].avgRating,
            ratingsQuantity : stats[0].numOfRatings
        });
    }
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage : 4,
            ratingsQuantity : 0
        });
    }  
}

reviewSchema.post('save', function() {      //Calculate average after review has been persisted to the database and hence, no next function
    this.constructor.averageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.review = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    this.review.constructor.averageRatings(this.review.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;