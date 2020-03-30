const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const {promisify} = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRATION});
}

const sendToken = (id,code,req,res,data=undefined) => {
    const token = signToken(id);
    const cookieOptions = {
        expires: new Date(Date.now()+process.env.COOKIE_EXPIRATION*60*60*1000),
        httpOnly: true,
        secure: req.secure||req.headers['x-forwaded-proto'] === 'https'
    }
    res.cookie('jwt',token,cookieOptions);
    if(data) {
        res.status(code).json({
            status: 'success',
            token,
            data
        });
        return;
    }
    res.status(code).json({
        status: 'success',
        token
    });
}

exports.signUp = catchAsync(async (req,res,next) => {
    if(req.body.role.toLowerCase() === 'admin')
        return next(new AppError('Denied',403));
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role.toLowerCase(),
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });
    await new Email(newUser, `${req.protocol}://${req.get('host')}/me`).sendWelcome();
    sendToken(newUser._id,201,req,res,{...newUser._doc,password:undefined,passwordConfirm:undefined});
});

exports.login = catchAsync(async (req,res,next) => {
    const {email,password} = req.body;
    if(!email||!password) {
        return next(new AppError('Please enter email and password',400));
    }
    const user = await User.findOne({email}).select('+password');
    const correct = user?await user.passwordsMatch(password,user.password):false;
    if(!correct||!user||user===null) {
        return next(new AppError('Incorrect credentials',401));
    }
    sendToken(user._id,200,req,res);
})

exports.logout = (req,res) => {
    res.cookie('jwt','logged_out',{
        expires: new Date(Date.now()+100),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

exports.protected = catchAsync(async (req,res,next) => {
    const {authorization} = req.headers;
    let token = undefined;
    if(authorization&&authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1];
    }
    else if(req.headers.cookie&&req.headers.cookie.startsWith('jwt=')) {
        //OR we can use req.cookies.jwt due to cookie parser, above statement doesn't require cookie parser
        token = req.headers.cookie.split('=')[1]||undefined;
    }
    else {
        return next(new AppError('Please log in to continue',401));
    }
    const verification = await promisify(jwt.verify)(token,process.env.JWT_SECRET);     //Turns .verify callback to a promise
    //Check if user still exists
    const tempUser = await User.findById(verification.id);
    if(!tempUser) {
        return next(new AppError('Invalid credentials',401));
    }
    //Check if password is still valid -> In user model.
    if(tempUser.changedPassword(verification.iat)) {
        return next(new AppError('Please login again',401));
    }
    req.user = tempUser;
    next();
})

exports.isLoggedIn = catchAsync(async (req,res,next) => {
    let token = undefined;
    try {
    if(req.headers.cookie&&req.headers.cookie.startsWith('jwt=')) {
    //OR we can use req.cookies.jwt due to cookie parser, above statement doesn't require cookie parser
        token = req.headers.cookie.split('=')[1]||undefined;
        const verification = await promisify(jwt.verify)(token,process.env.JWT_SECRET);     //Turns .verify callback to a promise
        const tempUser = await User.findById(verification.id);
        if(!tempUser) {
            return next();
        }
        if(tempUser.changedPassword(verification.iat)) {
            return next();
        }
        res.locals.user = tempUser;
        return next();
    }
}
catch(err) {
    return next();
}
    next();
})

exports.permission = (...roles) => {    //Spread here converts arguments to array
    return (req,res,next) => {
        if(!roles.includes(req.user.role))
            return next(new AppError('You do not have the permission to perform that action',403));
        next();
    }
}

exports.forgotPassword = catchAsync(async (req,res,next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError('Please enter valid email address',404));
    }
    const resetToken = user.createPasswordToken();
    await user.save({validateBeforeSave:false});
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
    try {
        await new Email(user,resetURL).sendReset();
        res.status(200).json({
            status: 'success',
            message: 'Email sent'
        });
    }
    catch(err) {
        user.passwordResetToken = undefined;
        user.passwordTokenExpiration = undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError('There was an error sending the link. Try again later',500));
    }
})

exports.resetPassword = catchAsync(async (req,res,next) => {
    const encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: encryptedToken});
    //OR await User.findONe({passwordResetToken: etc, passwordTokenExpiration: {$gt: Date.now()}})
    if(!user) 
        return next(new AppError('Invalid token',400));
    if(Date.now()>user.passwordTokenExpiration)
        return next(new AppError('Sorry, you took too long to reset the password', 401));
    if(!req.body.newPassword||!req.body.confirmPassword) 
        return next(new AppError('Please enter password', 400));
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordTokenExpiration = undefined;
    await user.save();
    sendToken(user._id,200,req,res);
})

exports.passwordChange = catchAsync(async(req,res,next) => {
    const user = await User.findById(req.user.id).select('+password');
    if(!user) 
        return next(new AppError('Please log in',401));
    if(!req.body.currentPassword)
        return next(new AppError('Please enter current password',400));
    const check = await user.passwordsMatch(req.body.currentPassword,user.password);
    if(!check||check===null||check===undefined)
        return next(new AppError('Current password is incorrect',401));
    if(!req.body.newPassword||!req.body.confirmNewPassword)
        return next(new AppError('Please enter a new password',400));
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.confirmNewPassword;
    await user.save();
    sendToken(user._id,200,req,res);
})