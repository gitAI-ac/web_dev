const mongoose = require('mongoose');
const validator = require('validator');

const slugify = require('slugify');

const emitter = require('events');

// Create an instance of EventEmitter
const eventEmitter = new emitter();

const User = require('./userModel');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'Maximum length crossed'],
    minlength: [5, 'Minimum length needed'],
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have an duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Wrong difficulty',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount price {VALUE} cannot be greater than the price',
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have cover image'],
  },
  images: {
    type: { String },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },

  startLocation: {
    //GeoJson
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});

tourSchema.index({ price: 1, slug: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.set('toObject', { virtuals: true });
tourSchema.set('toJSON', { virtuals: true });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//document middleware

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', async function (next) {
  const guidesPromise = this.guides.map(async (id) =>
    User.findByIdAndUpdate(id)
  );
  this.guides = await Promise.all(guidesPromise);
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: ['name', 'image', 'role', 'photo'],
  });
  next();
});

/*tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
});*/

/* tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

tourSchema.pre('save', function (next) {
  console.log('will save the document...');
  next();
}); */

//aggregation middleware

/* tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
}); */

const Tour = mongoose.model('Tour', tourSchema);

/* eventEmitter.on('newReview', async (model) => {
  const stats = Review.aggregate([
    {
      $match: { tour: model.tour },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  await Tour.findByIdAndUpdate(model.tour, {
    ratingsQuantity: stats[0].numRating,
    ratingsAverage: stats[0].averageRating,
  });
}); */

module.exports = Tour;
