const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name required']
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide valid email']
    },
    photo : {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'Password required'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user','guide','lead-guide','admin'],
        default: 'user'
    }    
    ,
    passwordConfirm : {
        type: String,
        required: [true, 'Confirm password'],
        validate: {
            //Works only on save
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordTokenExpiration: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    if(!this.isNew)
        this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.methods.passwordsMatch = async function(candidatePassword,userPassword) {
    return await bcrypt.compare(candidatePassword,userPassword);
} 

userSchema.methods.changedPassword = function(JWTtime) {
    if(this.passwordChangedAt) {
        const changed = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTtime<changed;
        }
    return false;
}

userSchema.methods.createPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordTokenExpiration = Date.now() + 600000;
    return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;