const path = require('path');
const express = require('express');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const cookieParser = require('cookie-parser');

const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

//1  Global middle wares

// Set security Http headers
/*app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: [
        "'self'",
        'https://api.mqcdn.com',
        'https://cdnjs.cloudflare.com',
        'http://127.0.0.1:3000',
      ],
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'https://api.mqcdn.com',
        'http://www.mapquestapi.com',
        'http://api-s.mqcdn.com',
        'http://attribution.aws.mapquest.com',
      ],
      imgSrc: ["'self'", 'data:', 'https://a.tiles.mapquest.com'],
    },
  })
);*/

//development blocking
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests from same api
const limiter = rateLimit({
  max: 50,
  windowMs: 2 * 60 * 1000,
  message: 'Too many requests, please try again in an hour',
});

app.use('/api', limiter);

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10KB' }));
//app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// data sanitization against Nosql query injection
app.use(mongoSanitize());

// data sanitization for xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);


app.use(compression());

//test middleware
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

////updating the reviews

////

//creating server

module.exports = app;
