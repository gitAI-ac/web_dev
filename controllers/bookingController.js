//const fs = require('fs');
const APIFeatures = require('../utils/apiFeatures');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { query } = require('express');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
const handler = require('./handlerFactory');

/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    //success_url: `${req.protocol}://${req.get('host')}/`,
    //cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();
  req.body.tour = tour;
  req.body.user = user;
  req.body.price = price;
  await Booking.create(req.body);
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = handler.createOne(Booking);
exports.updateBooking = handler.updateOne(Booking);

exports.deleteBooking = handler.createOne(Booking);

exports.getAllBookings = handler.getAll(Booking);
exports.getBooking = handler.getOne(Booking);
