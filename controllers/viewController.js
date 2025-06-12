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

exports.deleteBook = async (req, res, next) => {
  try {
    const books = await Book.find(); // fetch all books from the database

    res.status(200).render('deleteBook', {
      title: 'Delete a Book',
      books
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load delete book page.'
    });
  }
};


exports.updateBook = async (req, res, next) => {
  try {
    const books = await Book.find(); // fetch all books from the database

    res.status(200).render('updateBook', {
      title: 'Update a Book',
      books
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load update book page.'
    });
  }
};

exports.editBookForm = async (req, res) => {
  const book = await Book.findOne({ slug: req.params.slug });
  if (!book) return res.status(404).send('Book not found');

  res.status(200).render('editBook', {
    title: 'Edit Book',
    book   
  });
};

exports.getManageUsers = (req, res) => {
  res.status(200).render('user', {
    title: 'Add books to directory'
  });
};