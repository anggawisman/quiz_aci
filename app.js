const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const gameRouter = require('./routes/gameRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// define template view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

console.log(process.env.NODE_ENV);

// 1) GLOBAL MIDDLEWARE
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit if too many request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

// Data Sanitization againts NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization againts XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price ',
    ],
  })
); // hpp stand for HTTP Parameter Pollution

// Serving static files
// app.use(express.static(`${__dirname}/public`)); // to specify or serve static file from the folder not the route
// app.use(express.static(path.join__dirname, `public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 2) ROUTE HANDLERS/CONTROLLERS is divide it to controllers folder

// 3) ROUTES
// Pug Routes
app.use('/', (req, res) => {
  res.status(200).render('overview');
}); // parent route
// API Routes is divide it to routes folder
app.use('/api/v1/start', gameRouter); // parent route, it's also called mounting a new router

// HANDLE UNHANDLE ROUTE makesure this route on bot of others route
app.all('*', (req, res, next) => {
  // "*" means anything

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Operational Error Handling Middleware with Express
app.use(globalErrorHandler);

module.exports = app;

// 4) START SERVER is divide to server.js
