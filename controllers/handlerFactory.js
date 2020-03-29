const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const features = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req,res,next)=> {
    const tour = await Model.findByIdAndDelete(req.params.id);
    if(!tour) {
        return next(new AppError('No such document found',404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });  
})

exports.updateOne = Model => catchAsync(async (req,res,next)=> {
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    });
    if(!doc) {
        return next(new AppError('No such document found',404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    });
})

exports.createOne = Model => catchAsync(async (req,res,next) => {
    const newDoc = await Model.create(req.body);
    if(!newDoc) {
        return next(new AppError('Something went wrong',500));
    }
    res.status(201).json({
        status: 'success',
        data: {
            data: newDoc
        }
    });
}
)

exports.getOne = (Model,populateOptions) => catchAsync(async (req,res,next) => {
    let query = Model.findById(req.params.id);
    if(populateOptions)
        query = query.populate(populateOptions);
    const doc = await query;
    if(!doc)
        return next(new AppError('No such document found',404));
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
})

exports.getAll = Model => catchAsync(async (req,res,next) => {
    const modFeatures = new features(Model.find(),req.query).filter().sort().select().pagination();
    const mods = await modFeatures.Query;
    res.status(200).json({
        status: "success",
        results: mods.length,
        data: {
            data: mods
        }
    });
});