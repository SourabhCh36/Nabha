const express = require('express');
const router = express.Router();
const {
    getAllExams,
    createExam,
    updateExam,
    deleteExam,
    getExamById,
    getExamsByContext
} = require('../controllers/examController');

const { 
    authenticateToken, 
    authenticateAdminOnly,
    requireAdmin, 
    requireStudent 
} = require('../middleware/auth');

const { Exam, Question } = require('../models');


// GET /api/exams - Get all exams with optional filtering
// Users can only see exams from their own collegeId/branch
/*router.get('/', authenticateToken, getAllExams);*/
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { teacherId, collegeId, branch } = req.query;
        
        // If teacherId is provided, filter exams by teacher
        if (teacherId) {
            const exams = await Exam.find({ teacherId: teacherId }).lean();
            return res.json(exams);
        }
        
        // Otherwise, use the original getAllExams controller
        return getAllExams(req, res);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exams',
            error: error.message
        });
    }
});  

// IMPORTANT: Specific routes must come BEFORE catch-all routes!
// GET /api/exams/context/:collegeId/:branch - Get exams by specific context
// Users can only access their own collegeId/branch context
router.get('/context/:collegeId/:branch', authenticateToken, getExamsByContext);

// GET /api/exams/:examId/questions - Get all questions for an exam
router.get('/:examId/questions', authenticateToken, async (req, res) => {
    try {
        const { examId } = req.params;
        console.log('Fetching questions for exam:', examId);

        const questions = await Question.find({ examId: examId }).lean();
        console.log('Found questions:', questions.length);

        res.json(questions);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch questions',
            error: error.message
        });
    }
});

// GET /api/exams/:examId/details - Get exam details with student count (for admin/teacher)
router.get('/:examId/details', authenticateToken, async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findById(examId).lean();
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Get active students count (those currently taking the exam)
        const activeResults = await Result.find({
            examId: examId,
            submittedAt: null // Not submitted yet
        }).lean();

        // Add student count to exam data
        const examWithDetails = {
            ...exam,
            studentsCount: activeResults.length,
            activeStudents: activeResults.map(result => ({
                studentId: result.studentId,
                studentName: result.studentName || 'Unknown',
                startedAt: result.createdAt
            }))
        };

        res.json({
            success: true,
            data: examWithDetails
        });

    } catch (error) {
        console.error('Error getting exam details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get exam details',
            error: error.message
        });
    }
});

// GET /api/exams/:id - Get specific exam by ID (catch-all, must be LAST among GET routes)
// Users can only access exams they have permission for
router.get('/:id', authenticateToken, getExamById);

// POST /api/exams - Create new exam (Admin only, can create for any college)
/*router.post('/', authenticateAdminOnly, createExam);*/
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        
        // Allow both admins and teachers to create exams
        if (user.role !== 'admin' && user.userType !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins and teachers can create exams.'
            });
        }
        
        // If it's a teacher, ensure teacherId is included
        if (user.userType === 'teacher' && !req.body.teacherId) {
            req.body.teacherId = user.teacherId;
        }
        
        return createExam(req, res);
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create exam',
            error: error.message
        });
    }
});


// PUT /api/exams/:id - Update specific exam (Admin only, can update any exam)
/*router.put('/:id', authenticateAdminOnly, updateExam);*/
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const examId = req.params.id;
        
        // Allow both admins and teachers to update exams
        if (user.role !== 'admin' && user.userType !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins and teachers can update exams.'
            });
        }
        
        // If it's a teacher, ensure they can only update their own exams
        if (user.userType === 'teacher') {
            const exam = await Exam.findById(examId);
            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam not found'
                });
            }
            
            if (exam.teacherId !== user.teacherId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only update your own exams.'
                });
            }
        }
        
        return updateExam(req, res);
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update exam',
            error: error.message
        });
    }
});

// DELETE /api/exams/:id - Delete specific exam (Admin only, can delete any exam)
/*router.delete('/:id', authenticateAdminOnly, deleteExam);*/
// Updated to support both admin and teacher deletion
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const examId = req.params.id;
        
        // Allow both admins and teachers to delete exams
        if (user.role !== 'admin' && user.userType !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins and teachers can delete exams.'
            });
        }
        
        // If it's a teacher, ensure they can only delete their own exams
        if (user.userType === 'teacher') {
            const exam = await Exam.findById(examId);
            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam not found'
                });
            }
            
            if (exam.teacherId !== user.teacherId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only delete your own exams.'
                });
            }
        }
        
        return deleteExam(req, res);
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete exam',
            error: error.message
        });
    }
});




module.exports = router;