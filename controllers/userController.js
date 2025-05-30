const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');



exports.getAllUsers = catchAsync( async(req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: "success",
        results: users.length,
        data:{
            users
        }
    });
});

exports.getProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    
    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: "success",
        data:{
            user
        }
    });
});

exports.getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
        status: "success",
        data:{
            user
        }
    });
});

exports.createUser = catchAsync(async (req, res) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});

exports.updateUser = catchAsync(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});

exports.deleteUser = catchAsync(async (req, res) => {
    await User.findByIdAndDelete(req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        data: null
    }) 
});

exports.updateProfile = catchAsync(async (req, res) => {
    const userId = req.user.id; //ensure the userId is taken from the authenticated user information 

    const user = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        message: 'User Updated Successfully.'
    })
});

exports.deleteProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    res.status(200).json({
        status: 'success',
        message: 'User Deleted Successfully'
    }) 
});
