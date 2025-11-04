const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  /*teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },*/
  teacherId: {
  type: String,  // Change from ObjectId to String
  required: true
},
  videoUrl: {
    type: String,
    required: true
  },
  videoFileName: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Other'],
    default: 'Other'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
lectureSchema.index({ title: 'text', description: 'text', subject: 'text' });
lectureSchema.index({ teacherId: 1, uploadDate: -1 });

module.exports = mongoose.model('Lecture', lectureSchema);