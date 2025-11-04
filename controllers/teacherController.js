const jwt = require('jsonwebtoken');
const { User } = require('../models');


// Add to authController.js
exports.getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.std; // or however you get teacher ID from token
    
    // Get quiz count
    const quizzesCount = await Quiz.countDocuments({ 
      teacherId, 
      isActive: true 
    });
    
    // Get videos count (assuming you have a Video model)
    // const videosCount = await Video.countDocuments({ teacherId });
    
    // Get students count and performance data
    // This depends on your student/performance tracking system
    
    res.status(200).json({
      success: true,
      quizzesCount,
      // videosCount,
      // studentsCount,
      // avgPerformance
    });
    
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getStudentPerformance = async (req, res) => {
    try {
        const teacherId = req.user.teacherId;
        const classFilter = req.query.class;
        
        // Fetch student performance data
        const students = []; // Your database query here
        
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student data' });
    }
};

exports.updateTeacherProfile = async (req, res) => {
    try {
        const { fullName, password } = req.body;
        const teacherId = req.user.teacherId;
        
        const updateData = { fullName };
        if (password) {
            updateData.password = password; // Hash this if needed
        }
        
        await User.findOneAndUpdate({ teacherId }, updateData);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};