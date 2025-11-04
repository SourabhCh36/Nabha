// Updated Exam.js - Remove category, collegeId, branch and add teacherId requirement
const mongoose = require('mongoose');
const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    teacherId: {
        type: String,
        required: true,
        trim: true,
        index: true // Add index for better query performance
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 480 // 8 hours max
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'archived'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Rest of the fields remain the same...
    totalMarks: {
        type: Number,
        default: 0
    },
    passingMarks: {
        type: Number,
        default: 0
    },
    instructions: {
        type: String,
        maxlength: 2000
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    shuffleQuestions: {
        type: Boolean,
        default: false
    },
    shuffleOptions: {
        type: Boolean,
        default: false
    },
    showResults: {
        type: Boolean,
        default: true
    },
    allowReview: {
        type: Boolean,
        default: true
    },
    maxAttempts: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    requireCamera: {
        type: Boolean,
        default: false
    },
    preventTabSwitch: {
        type: Boolean,
        default: false
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Updated indexes - remove collegeId and branch, keep teacherId
examSchema.index({ teacherId: 1 });
examSchema.index({ status: 1 });
examSchema.index({ createdBy: 1 });
examSchema.index({ startDate: 1, endDate: 1 });

// Updated static method to find exams by teacherId
examSchema.statics.findByTeacher = function(teacherId, status = null) {
    const filter = { teacherId };
    if (status) filter.status = status;
    
    return this.find(filter)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 });
};

// Updated method to check if user can access exam
examSchema.methods.canUserAccess = function(userId, userTeacherId) {
    // Check if exam is public or user is in allowed list
    if (this.isPublic) return true;
    
    // Check if user is in allowed users list
    if (this.allowedUsers.includes(userId)) return true;
    
    // Check if user belongs to same teacher
    return this.teacherId === userTeacherId;
};

// Updated method to get active exams for a teacher
examSchema.statics.getActiveExamsForTeacher = function(teacherId) {
    const now = new Date();
    
    return this.find({
        teacherId: teacherId,
        status: 'active',
        $and: [
            {
                $or: [
                    { startDate: { $exists: false } },
                    { startDate: { $lte: now } }
                ]
            },
            {
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: { $gte: now } }
                ]
            }
        ]
    }).populate('createdBy', 'fullName');
};

module.exports = mongoose.model('Exam', examSchema);