const mongoose = require('mongoose');
const validator = require('validator');

const slugify = require('slugify');

const catchAsync = require('../utils/catchAsync');

//const User = require('./userModel');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    trim: true,
    required: [true, "Review can't be empty"],
  },
  images: {
    type: [String],
  },
  vulgarReview: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 4,
    required: [true, 'You must provide a rating'],
    set: (val) => Math.round(val * 10) / 10,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: true,
    unique: false,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: false,
  },
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.set('toObject', { virtuals: true });
reviewSchema.set('toJSON', { virtuals: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: ['name', 'photo', 'role'],
  });
  next();
});

reviewSchema.statics.calcAverageRating = catchAsync(async (tourId, Model) => {
  const stats = await Model.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].averageRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
});

//post middleware does not get access to next
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour, this.constructor);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  this.r.constructor.calcAverageRating(this.r.tour, this.r.constructor);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
