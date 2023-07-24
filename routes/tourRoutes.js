const express = require('express');

const tourController = require(`${__dirname}/../controllers/tourController`);

const authController = require('../controllers/authController');

const reviewRouter = require(`${__dirname}/../routes/reviewRoutes`);
const imageUtils = require('../utils/imageUtils');

const router = express.Router();

//router.param('id', tourController.checkID);
/* const checkPost = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'Fail',
      message: 'Missing name or price',
    });
  }
  next();
}; */

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/').get(tourController.getAllTours);
router.route('/:id').get(tourController.getParticularTour);

router
  .route('/tours-within/:distance/center/:latlang/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlang/unit/:unit').get(tourController.getDistances);

router.use(authController.protect);
router.use(authController.restrict('admin', 'guide', 'lead-guide'));

router
  .route('/:id')
  .patch(
    tourController.TourAuthenticator,
    tourController.uploadTourImages,
    imageUtils.resizePhotos,
    tourController.updateTour
  )
  .delete(tourController.TourAuthenticator, tourController.deleteTour);

router.route('/').post(tourController.postNewTour);

module.exports = router;
