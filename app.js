const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const expressSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.use(cors());

app.set('view engine', 'pug');

app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));     //Serves static assets of the app

//Middlewares
app.use(helmet());  //Helmet to secure over HTTP

if(process.env.NODE_ENV==='development')
app.use(morgan('dev'));    //Morgan for seeing requests in dev

app.use(express.json({limit: '10kb'}));

// app.use(cookieParser());    //Cookies can be accessed using req.cookies instead of req.headers.cookie, optional

app.use(expressSanitize());    //Prevent DB queries from input

app.use(xss());    //Prevent XSS attacks in body

app.use(hpp());    //Prevent parameter pollution

const limiter = rateLimit({
    windowMs: 60*60*1000,
    max: 100,
    message: 'Too many requests'
});

app.use("/api",limiter);    //To limit requests from one IP

//Route handler functions
//Routes
app.use('/',viewRouter);

app.use('/api/v1/tours',tourRouter);

app.use('/api/v1/users',userRouter);

app.use('/api/v1/reviews',reviewRouter);

app.use('/api/v1/bookings',bookingRouter);
//Catch all other routes
app.all('*',(req,res,next) => {
    // const err = new Error(`${req.originalUrl} not found`);
    // err.status = 'fail';
    // err.statusCode = 404;
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
});

app.use(globalErrorHandler);    //Handle internal errors in production

module.exports = app;