const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');

exports.topFive = (req,res,next) => {
    req.query.limit = '5',
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,duration,ratingsAverage,price,difficulty';
    next();
}

const multerStorage = multer.memoryStorage();       //SAVE TO BUFFER TO PROCESS USING SHARP

const multerFilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image'))
        cb(null,true);
    else
        cb(new AppError('Please upload an image', 400),false);
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadPhotos = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 5}
]);

exports.resizePhotos = catchAsync(async (req,res,next) => {
    if(!req.files.imageCover&&!req.files.images)
        return next();
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`; 
    await sharp(req.files.imageCover[0].buffer).resize(2000,1200).toFormat('jpeg').jpeg({quality: 80}).toFile(`public/img/tours/${req.body.imageCover}`);
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file,ind) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${ind+1}.jpeg`;
            await sharp(file.buffer).resize(2000,1200).toFormat('jpeg').jpeg({quality: 80}).toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename);
        })
    )
    next();
});

exports.getAllTours = factory.getAll(Tour);
exports.newTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour,{path: 'reviews', select: '-user -_id'});
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req,res,next) => {
    let {distance,latlong,unit} = req.params;
    distance = distance*1;
    let [lat,long] = latlong.split(',');
    lat = lat*1;
    long = long*1;
    if(typeof(distance)!=='number'||typeof(lat)!=='number'||typeof(long)!=='number'||!(unit==='km'||unit==='mi'))
        return next(new AppError('Please provide request in valid format',400));
    if(!lat||!long) {
        return next(new AppError('Please specify central location', 400));
    }
    const radius = unit === 'mi'? distance/3963.2: distance/6378.1;
    const tours = await Tour.find({startLocation : {
        $geoWithin : {
            $centerSphere : [[long,lat],radius]
        }
    }});
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});