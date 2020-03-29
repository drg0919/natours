const AppError = require('../utils/appError');

const sendErrorDev = (err,req,res) => {
    if(req.originalUrl.startsWith('/api'))
    {
        res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
            error:err,
            stack: err.stack
        });
    }
    else {
        res.status(err.statusCode).render('error', {
            message: err.message
        });
    }
    
}

const sendErrorProd = (err,req,res) => {
    if(req.originalUrl.startsWith('/api'))
    {
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status:err.status,
                message:err.message
            });
        }
        console.error("ERROR :",err);
         return res.status(500).json({
            status:'error',
            message:'Something went wrong'
        });
    }
        if(err.isOperational) {
            res.status(err.statusCode).render('error',{
                message:err.message
            });
        }
        else {
            console.error("ERROR :",err);
            res.status(500).render('error',{
                message:'Something went wrong'
            })
        }
}

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message,400);
}

const handleDuplicateErrorDB = err => {
    const value = err.errmessage.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}`;
    return new AppError(message,400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message,400);
}

const handleInvalidJWT = () => {
    new AppError('Invalid JWT. Please login again', 401);
}

const handleJWTExpiration = () => {
    new AppError('Token expired. Please login again', 401);
}

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode||500;
    err.status = err.status||'error';
    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err,req,res);
    }
    else if(process.env.NODE_ENV === 'production') {
        let error = {...err};
        error.message = err.message;
        if(error.name==='CastError') {
            error = handleCastErrorDB(error);
        }
        if(error.code===11000) {
            error = handleDuplicateErrorDB(error);
        }
        if(error.name==='ValidationError')
        {
            error = handleValidationErrorDB(error);
        }
        if(error.name==='JsonWebTokenError') {
            error = handleInvalidJWT();
        }
        if(error.name==='TokenExpiredError') {
            error = handleJWTExpiration();
        }
        sendErrorProd(error,req,res);
    }
}