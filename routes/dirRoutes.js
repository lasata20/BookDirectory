const express = require('express');
const dirController = require('../controllers/dirController');
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');
const multer = require('multer');

const router = express.Router();

const upload = multer({ dest: 'public/img/books' }); 

router
    .route('/')
    .post(authController.protect, authController.restrictTo('admin'), dirController.uploadBookAssets, dirController.createBook);

router
    .route('/:id')
    .get(authController.protect, dirController.getBookById)
    .patch(authController.protect, authController.restrictTo('admin'), upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
    ]),
     dirController.updateBook)
    .delete(authController.protect, authController.restrictTo('admin'), dirController.deleteBook);

module.exports = router;