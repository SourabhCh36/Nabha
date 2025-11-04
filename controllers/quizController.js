// controllers/quizController.js
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');
// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, class: className, questions, teacherId, teacherName } = req.body;

    // Validate input
    if (!title || !className || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, class, and at least one question are required'
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text || !question.options || !question.correctAnswer) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is missing required fields`
        });
      }
      
      if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have all four options (A, B, C, D)`
        });
      }
      
      if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} has invalid correct answer`
        });
      }
    }

    const newQuiz = new Quiz({
      title,
      class: className,
      questions,
      teacherId,
      teacherName
    });

    const savedQuiz = await newQuiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: savedQuiz
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all quizzes by teacher
exports.getQuizzesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const quizzes = await Quiz.find({ 
      teacherId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      quizzes
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get quiz by ID
/*exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      quiz
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
*
// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, class: className, questions } = req.body;

    // Validate questions if provided
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.text || !question.options || !question.correctAnswer) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} is missing required fields`
          });
        }
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { 
        ...(title && { title }),
        ...(className && { class: className }),
        ...(questions && { questions }),
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
*/
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format'
      });
    }
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      quiz
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update quiz - Add ObjectId validation
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, class: className, questions } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format'
      });
    }

    // Validate questions if provided
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.text || !question.options || !question.correctAnswer) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} is missing required fields`
          });
        }
        
        if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have all four options (A, B, C, D)`
          });
        }
        
        if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} has invalid correct answer`
          });
        }
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { 
        ...(title && { title }),
        ...(className && { class: className }),
        ...(questions && { questions }),
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add question to existing quiz
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { text, options, correctAnswer } = req.body;

    // Validate question data
    if (!text || !options || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question text, options, and correct answer are required'
      });
    }

    if (!options.A || !options.B || !options.C || !options.D) {
      return res.status(400).json({
        success: false,
        message: 'All four options (A, B, C, D) are required'
      });
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer must be A, B, C, or D'
      });
    }

    const quiz = await Quiz.findById(quizId);
    
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const newQuestion = {
      text,
      options,
      correctAnswer
    };

    quiz.questions.push(newQuestion);
    quiz.updatedAt = Date.now();
    
    const updatedQuiz = await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Question added successfully',
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update specific question
exports.updateQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.params;
    const { text, options, correctAnswer } = req.body;

    const quiz = await Quiz.findById(quizId);
    
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    // Update question fields if provided
    if (text) quiz.questions[questionIndex].text = text;
    if (options) quiz.questions[questionIndex].options = options;
    if (correctAnswer) quiz.questions[questionIndex].correctAnswer = correctAnswer;
    
    quiz.updatedAt = Date.now();
    const updatedQuiz = await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete specific question
exports.deleteQuestion = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.params;

    const quiz = await Quiz.findById(quizId);
    
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    if (quiz.questions.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only question in quiz'
      });
    }

    quiz.questions.splice(questionIndex, 1);
    quiz.updatedAt = Date.now();
    
    const updatedQuiz = await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      quiz: updatedQuiz
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/*/ Soft delete quiz (mark as inactive)
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { 
        isActive: false,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};*/
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format'
      });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { 
        isActive: false,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get quizzes by class (for students)
exports.getQuizzesByClass = async (req, res) => {
  try {
    const { className } = req.params;
    
    const quizzes = await Quiz.find({ 
      class: className, 
      isActive: true 
    }).select('title class teacherName createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      quizzes
    });

  } catch (error) {
    console.error('Error fetching quizzes by class:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
