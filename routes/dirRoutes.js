const express = require('express');
const dirController = require('../controllers/dirController');
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');

const router = express.Router();

// router.param('id', dirController.checkID);

router
    .route('/')
    .get(viewController.getLoginForm)

router
    .route('/login')
    .post(authController.login);

router
    .route('/overview')
    .get(authController.protect, viewController.getOverview);

router
    .route('/books')
    .post(authController.protect, authController.restrictTo('admin'), dirController.uploadPhoto, dirController.createBook);

router
    .route('/books/:id')
    .get(authController.protect, dirController.getBookById)
    .patch(dirController.updateBook)
    .delete(authController.protect, authController.restrictTo('admin'), dirController.deleteBook);

module.exports = router;