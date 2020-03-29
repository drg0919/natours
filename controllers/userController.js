const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//FOR STORING IMAGES DIRECTLY TO DATABASE WITHOUT PROCESSING THEM.
// const multerStorage = multer.diskStorage({
//     destination: (req,file,cb) => {
//         cb(null,'public/img/users');
//     },
//     filename: (req,file,cb) => {
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     }
// });

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

exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = catchAsync(async (req,res,next) => {
    if(!req.file)
        return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;   //REQUIRED IN UPDATEME MIDDLEWARE
    await sharp(req.file.buffer).resize(400,400).toFormat('jpeg').jpeg({quality: 80}).toFile(`public/img/users/${req.file.filename}`);
    next();
});

exports.getUserId = (req,res,next) => {
    if(req.params.id)
        return next();
    req.params.id = req.user.id;
    next();
}


exports.deleteMe = catchAsync(async (req,res) => {
    await User.findByIdAndUpdate(req.user.id,{active: false});
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.updateMe = catchAsync(async (req,res,next) => {
    const {name,email} = req.body;
    let updated = {name,email};
    // if( name === req.user.name && email === req.user.email)
    //     next(new AppError('Data entered is the same', 400));
    if(!name && !email) {
        next(new AppError('Please enter data', 400));
    }
    if(req.file)
        updated = {...updated, photo: req.file.filename};
    console.log(updated);
    const doc = await User.findByIdAndUpdate(req.user.id,updated,{
        new: true,
        runValidators: true
    });
    if(!doc) {
        return next(new AppError('No such user found',404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    });
});

exports.newUser = (req,res,next) => {
    res.status(302).json({
        status: "fail",
        message: "To add a user go to /signup"
    });
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);       //Don't update password using this middleware
exports.deleteUser = factory.deleteOne(User);
