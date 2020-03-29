const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [10,'Tour name must be more than 10 characters'],
        maxlength: [40,'Tour name must not be more than 40 characters']
    },
    duration : {
        type: Number,
        required: [true,'Tour must have a duration']
    },
    maxGroupSize : {
        type: Number,
        required: [true,'Tour must have a maximum group size']
    },
    difficulty: {
        type: String,
        required: [true,'Tour must have a difficulty'],
        enum: {
            values: ['easy','medium','difficult'],
            message: 'Difficulty : easy,medium,hard'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4,
        min: [1,'Rating must be at least 1'],
        max: [5,'Rating cannot be more than 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true,'Tour must have a price']
    },
    priceDiscount : {
        type: Number,
        validate: {
            validator: function(val) {
                return val<this.price
            },
            message: 'Discount cannot be more than price'
        }
    },
    summary: {
        type: String,
        trim: true
        }
    ,
    description: {
        type: String,
        required: [true,'Tour must have a description'],
        trim: true
    },
    imageCover : {
        type: String,
        required: [true,'Tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates : [Date],
    slug: String,
    secret: Boolean,
    startLocation: {
        type: {
        type: String,
        default: 'Point',
        enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
    }],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},{
    toObject: {
        virtuals: true
    },
    toJSON : {
        virtuals: true
    }
});

tourSchema.index({price: 1, duration: 1});
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {
        lower: true,
        replacement: '_'
    });
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.find({secret: {$ne: true}});
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({             //In query middleware, this refers not to the document but the query
        path: 'guides',
        select : '-__v -passwordChangedAt'
    });
    next();
})

tourSchema.pre('aggregate',function(next) {
    this.pipeline().unshift({$match: {secret: {$ne: true}}});
    next();
})

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;