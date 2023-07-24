const express = require('express');

const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`${__dirname}/../controllers/authController`);
const imageUtils = require(`${__dirname}/../utils/imageUtils`);
const bookingController = require(`${__dirname}/../controllers/bookingController`);

const router = express.Router();
router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router.use(authController.restrict('admin', 'guide', 'lead-guide'));
router
  .get('/', bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
