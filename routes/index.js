const express = require('express');
const viewRoutes = require('./viewRoutes');
const authRoutes = require('./authRoutes');
const examRoutes = require('./examRoutes');
const questionRoutes = require('./questionRoutes');
const lectureRoutes = require('./lectureRoutes');
const resultRoutes = require('./resultRoutes');
//const teacherRoutes = require('./teacherRoutes');



const router = express.Router();


router.use ('/api/auth',authRoutes);
/*router.use('/api/teacher', teacherRoutes);*/  
router.use('/api/exams', examRoutes);      // Exam management routes
router.use('/api/questions', questionRoutes); // Question management routes
router.use('/api/lectures', lectureRoutes); // Lecture management routes
router.use('/api/results', resultRoutes);  // Result submission routes
router.use('/', viewRoutes);
            // View routes (HTML pages)

module.exports = router;
