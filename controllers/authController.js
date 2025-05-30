const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/mail');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });

};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const url = `${req.protocol}://${req.get('host')}profile`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
    
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    //Check if email and password exist
    if(!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }
    //Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    //If everything ok, send token to client
    createSendToken(user, 200, res);
});


exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    
    res.status(200).json({ status: 'success', message: 'Logged Out!!!' });
};


exports.protect = catchAsync ( async (req, res, next) => {
    // Getting token and check if it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if(!token) {
        return next(new AppError('Please Log In!!!', 401));
    }
    // Verifying token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('User belonging to token no longer exist.', 401));
    }

    // Check if user changed pw after token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Password Changed! Login Again!', 401));
    }  

    req.user = currentUser;
    res.locals.user = currentUser;

    console.log('User authenticated');
    next();
});

//only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // Verifying token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if(!currentUser) {
                return next();
            }

            // Check if user changed pw after token was issued
            if(currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }  

            //there is loggedIn user
            res.locals.user = currentUser;  
            return next();
        } catch (err){
            return next();
        } 
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You have no permission!', 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync( async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('User not found!!!', 404));
    }

    //Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //Send it to user's mail
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resestPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!!'
        });
    }catch(err) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('Error sending Email!', 500));
    }    
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpires: { $gt: Date.now() }
    });

    if(!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);

});

exports.updatePassword = catchAsync(async(req, res, next) => {
     // 1) Get user from collection
     const user = await User.findById(req.user.id).select('+password');

     // 2) Check if POSTed current password is correct
     if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
         return next(new AppError('Your current password is incorrect.', 401));
     }
 
     // 3) If so, update the password
     user.password = req.body.newPassword;
     user.confirmPassword = req.body.confirmPassword;
     await user.save();
 
     // 4) Log user in, send JWT
     createSendToken(user, 200, res);
});


