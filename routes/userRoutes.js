const express = require('express');

const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`${__dirname}/../controllers/authController`);
const imageUtils = require('../utils/imageUtils');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  imageUtils.resizePhotos,
  userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);

router.use(authController.restrict('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    userController.uploadUserPhoto,
    imageUtils.resizePhotos,
    userController.updateUser
  )
  .delete(userController.deleteUser);
module.exports = router;
