//const fs = require('fs');
const APIFeatures = require('../utils/apiFeatures');

const { query } = require('express');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const handler = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const imageUtils = require('../utils/imageUtils');

/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: imageUtils.multerFilter,
});

// when only for one field than
/* 
upload.array('images', maxCount:3)
*/
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3, minCount: 3 },
]);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/* exports.checkID = (req, res, next, val) => {
  console.log(req.params);
  console.log(`tour id is ${val}`);
  if (val * 1 >= tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }
  next();
}; */

exports.getAllTours = handler.getAll(Tour);

const popOption = [
  {
    path: 'review',
  },
  {
    path: 'guides',
    select: ['-__v', '-passwordChangedAt'],
  },
];

exports.TourAuthenticator = async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: 'guides',
    select: ['id'],
  });
  let deleted = false;
  tour.guides.forEach((el) => {
    if (el.id === req.user.id) {
      deleted = true;
      next();
    }
  });
  if (!deleted && req.user.role === 'admin') {
    deleted = true;
    next();
  }
  if (!deleted) next(new AppError('you cannot modify/delete others tour', 404));
};

exports.getParticularTour = handler.getOne(Tour, popOption);

exports.postNewTour = handler.createOne(Tour);

exports.updateTour = handler.updateOne(Tour);

exports.deleteTour = handler.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $addFields: { month: { $month: '$startDates' } },
    },
    {
      $addFields: { year: { $year: '$startDates' } },
    },
    {
      $match: { year: year },
    },
    {
      $group: {
        _id: '$month',
        numTours: { $sum: 1 },
        tourName: { $addToSet: '$name' },
      },
    },
    {
      $sort: { numTours: -1 },
    },
    /*       {
        $limit: 1,
      }, */
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlang, unit } = req.params;
  const [lat, lang] = latlang.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lang)
    next(new AppError('Please provide the starting location', 400));

  //console.log(distance, unit, lat, lang);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lang, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlang, unit } = req.params;
  const [lat, lang] = latlang.split(',');
  if (!lat || !lang)
    next(new AppError('Please provide the starting location', 400));
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lang * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
    {
      $sort: { distance: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
