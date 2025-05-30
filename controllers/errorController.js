const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
    const value = err.errmsg.match(/([" '])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}. Please use another value.`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = err => new AppError('Invalid Token. Please login again!', 401);

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            // error: err,
            message: err.message,
            // stack: err.stack
        });
    } else {
        return res.status(err.statusCode).render('error', {
            title: 'something went wrong!',
            msg: err.message
        });
    }
   
};

const sendErrorProd = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } 
        
        return res.status(500).json({
            status: 'error',
            message: 'Something Went Wrong!'
        });
    }
    // RENDERED WEBSITE
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'something went wrong!',
            msg: err.message
        });
    } 
        return res.status(err.statusCode).render('error', {
            title: 'something went wrong!',
            msg: 'Please Try Again Later'
        });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if(process.env.NODE_ENV === 'production') {
        sendErrorProd(err, req, res);
    }
};