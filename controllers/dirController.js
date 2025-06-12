// const fs = require('fs');
const mongoose = require('mongoose');
const multer =require('multer');
const Book = require('../models/dirModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const path = require('path');



// const books = JSON.parse(
//     fs.readFileSync(`./dev-data/data/books-simple.json`)
// );


const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, 'public/img/books');
    } else if (file.fieldname === 'file') {
      cb(null, 'public/files/books');
    } else {
      cb(new AppError('Unknown field'), false);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (file.fieldname === 'image') {
      cb(null, `book-${Date.now()}.jpg`);
    } else if (file.fieldname === 'file') {
      cb(null, `book-file-${Date.now()}.pdf`);
    }
  }
});

const multerFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    const allowedImageExts = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedImageExts.includes(ext)) {
      return cb(new AppError('Only image files are allowed!'), false);
    }
  }

  if (file.fieldname === 'file') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new AppError('Only PDF files are allowed!'), false);
    }
  }

  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadBookAssets = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

exports.getAllBooks = catchAsync(async (req, res) => {
    const books = await Book.find();

    res.status(200).json({
        status: "success",
         results: books.length,
        data:{
                books
        }
    });
});

exports.getBookById = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    res.status(200).json({
        status: "success",
        data:{
            book
        }
    });
});

exports.createBook = catchAsync(async (req, res, next) => {
//   console.log('📸 req.files:', req.files);
//   console.log('📝 req.body:', req.body);

  if (!req.files || !req.files.image || req.files.image.length === 0) {
    return next(new AppError('No image uploaded', 400));
  }

  const image = req.files.image[0].filename;
  const file = req.files.file?.[0]?.filename;

  const newBookData = {
    ...req.body,
    image,
    ...(file && { file })
  };

  const newBook = await Book.create(newBookData);

    res.status(200).json({
        status: 'success',
        data: {
            newBook
        }
    })
});

exports.updateBook = catchAsync(async (req, res, next) => {
    const updateFields = {
      name: req.body.name,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
    };

    if (req.files?.image) {
      updateFields.image = req.files.image[0].filename;
    }

    if (req.files?.file) {
      updateFields.file = req.files.file[0].filename;
    }  

    const book = await Book.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
        runValidators: true
    });

    if(!book) {
        return next(new AppError('No Book found', 404))
    }

    // res.status(200).json({
    //     status: 'success',
    //     data: null
    // })
  
    res.redirect('/overview');
});


exports.deleteBook =  catchAsync(async (req, res, next) => {
    const book = await Book.findByIdAndDelete(req.params.id, req.body);

    if(!book) {
        return next(new AppError('No Book found', 404))
    }

    // res.status(200).json({
    //     status: 'success',
    //     data: null
    // }) 

    res.redirect('/manage-directory/delete-Book');
});