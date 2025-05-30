const Book = require('../models/dirModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const books = await Book.find(); //Getting data from collection

  res.status(200).render('overview', {
    title: 'All Books',
    books
  });
});

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findOne({slug: req.params.slug});

  if(!book) {
    return next(new AppError('No book found', 404));
  }

  res.status(200).render('book', {
    title: `${book.name}`,
    book
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log In To Your Account'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up to Create an Account'
  })
};

exports.getProfile = (req, res) => {
  res.status(200).render('profile', {
    title: 'Your Profile'
  });
};

exports.updateUserData = catchAsync(async (req, res,next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },
  {
    new: true,
    runValidator: true
  });

  res.status(200).render('profile', {
    title: 'Your Profile',
    user: updatedUser
  });

});


exports.getManageDirectory = (req, res) => {
  res.status(200).render('directory', {
    title: 'Add books to directory'
  });
};

exports.createBookForm = (req, res) => {
  res.status(200).render('createBook', {

  })
};

exports.getManageUsers = (req, res) => {
  res.status(200).render('user', {
    title: 'Add books to directory'
  });
};