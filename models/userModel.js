const mongoose = require ('mongoose');
const crypto = require ('crypto');
const validator = require ('validator');
const bcrypt = require ('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type:  String,
        required: [true, 'Name required'],
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide valid mail']
    },   
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },    
    confirmPassword: {
        type: String, 
        required: true,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: `Passwords don't match!!`
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

userSchema.pre('save', async function(next) {
    //only if password is modified
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);

    this.confirmPassword = undefined;
    next();
});

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        
        console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp; 
    }
    
    
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(16).toString('hex'); //generate a random token

    //hash the token for security
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    //return unhashed reset token
    return resetToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;