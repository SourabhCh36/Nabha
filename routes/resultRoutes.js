const express = require('express');
const router = express.Router();
const { Result, Exam, Question } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

// POST /api/results - Submit exam result
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const studentId = req.user.userId || req.user._id;

    console.log('Result submission request:', { examId, answersCount: answers?.length, studentId });

    // Validate examId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      console.error('Invalid exam ID format:', examId);
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID format'
      });
    }

    // Fetch the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      console.error('Exam not found:', examId);
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Fetch all questions for this exam
    const questions = await Question.find({ examId: examId });
    console.log('Found questions:', questions.length);
    
    if (questions.length === 0) {
      console.error('No questions found for exam:', examId);
      return res.status(400).json({
        success: false,
        message: 'No questions found for this exam'
      });
    }

    // Calculate score based on marks
    let score = 0;
    let totalMarks = 0;
    const processedAnswers = [];

    for (const question of questions) {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      let isCorrect = false;
      const questionMarks = question.marks || 1;
      totalMarks += questionMarks;

      if (question.type === 'multiple-choice') {
        // For multiple choice, check if answer index matches
        isCorrect = userAnswer && parseInt(userAnswer.userAnswer) === question.correctAnswer;
        if (isCorrect) score += questionMarks;
      } else if (question.type === 'true-false') {
        // For true/false, check the boolean value
        const correctAnswer = question.correctAnswer === true || question.correctAnswer === 'true' ? 1 : 0;
        isCorrect = userAnswer && parseInt(userAnswer.userAnswer) === correctAnswer;
        if (isCorrect) score += questionMarks;
      } else if (question.type === 'descriptive') {
        // Descriptive answers are not auto-scored, marked for manual review
        isCorrect = false;
      }

      processedAnswers.push({
        questionId: question._id,
        userAnswer: userAnswer ? userAnswer.userAnswer : null,
        questionType: question.type,
        isCorrect: isCorrect,
        marks: questionMarks,
        earnedMarks: isCorrect ? questionMarks : 0
      });
    }

    const percentage = (score / totalMarks) * 100;
    const passed = percentage >= 50; // 50% passing threshold

    // Create result document
    const result = new Result({
      examId: new mongoose.Types.ObjectId(examId),
      studentId: new mongoose.Types.ObjectId(studentId),
      answers: processedAnswers,
      score,
      totalMarks,
      totalQuestions: questions.length,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      submittedAt: new Date()
    });

    await result.save();

    console.log('Result saved:', {
      examId,
      studentId,
      score,
      totalMarks,
      totalQuestions: questions.length,
      percentage,
      passed
    });

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        score,
        totalMarks,
        totalQuestions: questions.length,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        resultId: result._id
      }
    });

  } catch (error) {
    console.error('Error submitting exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam result',
      error: error.message
    });
  }
});

// GET /api/results/all-by-teacher - Get all results for teacher's exams
// MUST BE BEFORE /:resultId route to avoid matching conflict
router.get('/all-by-teacher', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.teacherId || req.user._id;

    // Get all exams by this teacher
    const exams = await Exam.find({ teacherId: teacherId }).select('_id');
    const examIds = exams.map(e => e._id);

    // Get all results for these exams
    const results = await Result.find({ examId: { $in: examIds } })
      .populate('examId', 'title description')
      .populate('studentId', 'firstName lastName fullName')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error fetching teacher results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
});

// GET /api/results/student/:studentId - Get all results for a student
// MUST BE BEFORE /:resultId route to avoid matching conflict
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    const results = await Result.find({ studentId: new mongoose.Types.ObjectId(studentId) })
      .populate('examId', 'title description')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student results',
      error: error.message
    });
  }
});

// GET /api/results/:resultId - Get specific result
router.get('/:resultId', authenticateToken, async (req, res) => {
  try {
    const { resultId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result ID format'
      });
    }

    const result = await Result.findById(resultId)
      .populate('examId', 'title description')
      .populate('answers.questionId', 'text options correctAnswer');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result',
      error: error.message
    });
  }
});

module.exports = router;
