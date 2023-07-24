const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./catchAsync');
const appError = require('./appError');

function giveimagesname(req, id) {
  let curIndex = 0;
  req.forEach((element) => {
    element.filename = `tour-${id}-image-${curIndex + 1}.jpeg`;
    curIndex += 1;
  });
  return req;
}

async function savemultipleimages(req) {
  await req.forEach(async (element) => {
    await sharp(element.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${element.filename}`);
  });
}

exports.resizePhotos = catchAsync(async (req, res, next) => {
  if (!req.file && !req.files) return next();
  if (req.files) {
    req.files.imageCover.filename = `tour-${req.params.id}-imageCover.jpeg`;
    req.files.imges = giveimagesname(req.files.images, req.params.id);
    //console.log(req);
    if (req.files.imageCover) {
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.files.imageCover.filename}`);
      req.body.imageCover = req.files.imageCover.filename;
    }
    if (req.files.images) {
      await savemultipleimages(req.files.images);
      req.body.images = req.files.images.map((obj) => obj.filename);
    }
  } else {
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);
    req.body.photo = req.file.filename;
  }
  next();
});

exports.multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! pls upload only image', 400), false);
  }
};
