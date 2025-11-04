const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
/*
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    DOB:{
        type:String,
        required: true,
        trim: true
    },
    std:{
        type: String,
        required: function () {
            return this.userType === "student";
        },
        trim: true
    },
    userType: {  // Add this missing field
        type: String,
        required: true,
        enum: ['student', 'admin', 'teacher'], // Add valid user types
        default: 'student'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});*/
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    DOB: {
        type: String,
        required: function () {
            return this.userType === "student";
        },
        trim: true
    },
    std: {
        type: String,
        required: function () {
            return this.userType === "student";
        },
        trim: true
    },
    teacherId: {
        type: String,
        required: function () {
            return this.userType === "teacher";
        },
        trim: true,
        unique: true,
        sparse: true // Allows null values but ensures uniqueness when present
    },
    password: {
        type: String,
        required: function () {
            return this.userType === "teacher";
        },
        trim: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['student', 'admin', 'teacher'],
        default: 'student'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
/*userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});*/
// Add to your User.js before save
userSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    this.updatedAt = Date.now();
    next();
});

// Index for better query performance
userSchema.index({ fullName: 1, std: 1 });
userSchema.index({ fullName: 1, teacherId: 1 });
userSchema.index({ teacherId: 1 });


module.exports = mongoose.model('User', userSchema);