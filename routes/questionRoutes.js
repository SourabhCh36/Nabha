const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Question, Exam } = require('../models');

// GET all questions for an exam
router.get('/exam/:examId', authenticateToken, async (req, res) => {
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

// GET single question
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id).lean();

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.json(question);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch question',
            error: error.message
        });
    }
});

// CREATE new question
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { text, type, examId, options, correctAnswer, marks } = req.body;
        console.log('Creating question:', { text, type, examId, marks });

        // Validate required fields
        if (!text || !type || !examId) {
            return res.status(400).json({
                success: false,
                message: 'Text, type, and examId are required'
            });
        }

        // Verify exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        let questionData = {
            text,
            type,
            examId,
            marks: marks || 1
        };

        // Handle options based on type
        if (type === 'multiple-choice') {
            if (!options || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Multiple choice questions require at least 2 options'
                });
            }
            
            // Convert options array of objects to format the model expects
            const optionTexts = options.map(opt => 
                typeof opt === 'string' ? opt : opt.text
            );
            questionData.options = optionTexts;
            
            // Find the correct option index
            if (options.length > 0 && typeof options[0] === 'object') {
                const correctIndex = options.findIndex(opt => opt.isCorrect);
                questionData.correctAnswer = correctIndex >= 0 ? correctIndex : 0;
            } else {
                questionData.correctAnswer = correctAnswer || 0;
            }
        } else if (type === 'true-false') {
            questionData.options = ['True', 'False'];
            questionData.correctAnswer = correctAnswer === true || correctAnswer === 'true' ? 0 : 1;
        } else if (type === 'descriptive') {
            questionData.options = ['Descriptive Answer'];
            questionData.correctAnswer = 0;
        }

        const question = new Question(questionData);
        const savedQuestion = await question.save();
        console.log('Question created:', savedQuestion._id);

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            question: savedQuestion
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create question',
            error: error.message
        });
    }
});

// UPDATE question
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { text, type, options, correctAnswer, marks } = req.body;
        console.log('Updating question:', id);

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Update fields
        if (text) question.text = text;
        if (type) question.type = type;
        if (marks) question.marks = marks;

        // Handle options based on type
        if (type === 'multiple-choice') {
            if (!options || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Multiple choice questions require at least 2 options'
                });
            }
            
            const optionTexts = options.map(opt => 
                typeof opt === 'string' ? opt : opt.text
            );
            question.options = optionTexts;
            
            if (options.length > 0 && typeof options[0] === 'object') {
                const correctIndex = options.findIndex(opt => opt.isCorrect);
                question.correctAnswer = correctIndex >= 0 ? correctIndex : 0;
            } else {
                question.correctAnswer = correctAnswer || 0;
            }
        } else if (type === 'true-false') {
            question.options = ['True', 'False'];
            question.correctAnswer = correctAnswer === true || correctAnswer === 'true' ? 0 : 1;
        }

        const updatedQuestion = await question.save();
        console.log('Question updated:', updatedQuestion._id);

        res.json({
            success: true,
            message: 'Question updated successfully',
            question: updatedQuestion
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update question',
            error: error.message
        });
    }
});

// DELETE question
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting question:', id);

        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        console.log('Question deleted:', id);
        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete question',
            error: error.message
        });
    }
});

module.exports = router;
