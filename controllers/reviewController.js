const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handler = require('./handlerFactory');

exports.setTourAndUser = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};

exports.reviewAuthenticator = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'user',
    select: ['id', 'name'],
  });
  if (review.user.id === req.user.id || req.user.role === 'admin') next();
  else next(new AppError('you cannot modify/delete others tour', 404));
});

const popOption = [
  {
    path: 'user',
    select: ['name', 'photo'],
  },
  {
    path: 'tour',
    select: ['name', 'ratingsAverage', 'ratingsQuantity', 'createdAt'],
  },
];

//

//
//admin function
exports.createReview = handler.createOne(Review);
exports.deleteReview = handler.deleteOne(Review);
exports.updateReview = handler.updateOne(Review);
exports.getParticularReview = handler.getOne(Review, popOption);
exports.getAllReviews = handler.getAll(Review);
