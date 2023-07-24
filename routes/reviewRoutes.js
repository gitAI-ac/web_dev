const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrict('admin'), reviewController.getAllReviews)
  .post(
    authController.restrict('user'),
    reviewController.setTourAndUser,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(authController.restrict('admin'), reviewController.getParticularReview)
  .delete(
    authController.restrict('admin', 'user'),
    reviewController.reviewAuthenticator,
    reviewController.deleteReview
  )
  .patch(
    authController.restrict('admin', 'user'),
    reviewController.reviewAuthenticator,
    reviewController.updateReview
  );

module.exports = router;
