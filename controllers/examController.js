const { Exam, Question } = require('../models');

// Updated examController.js - Use teacherId instead of collegeId, branch, user1Id

// Updated getAllExams function
const getAllExams = async (req, res, next) => {
    try {
        const { teacherId } = req.query;
        console.log('Fetching exams with teacherId:', teacherId);
        console.log('Request user:', req.user);
        
        // Build filter object with teacherId
        let filter = {};
        if (teacherId) {
            filter.teacherId = teacherId;
        }

        console.log('Applied filter:', filter);
        
        const exams = await Exam.find(filter).populate('createdBy', 'fullName');
        
        // Get question count for each exam
        const examsWithQuestionCount = await Promise.all(
            exams.map(async (exam) => {
                const questionCount = await Question.countDocuments({ examId: exam._id });
                return {
                    id: exam._id,
                    title: exam.title,
                    description: exam.description,
                    duration: exam.duration,
                    status: exam.status,
                    questionCount: questionCount,
                    createdAt: exam.createdAt,
                    createdBy: exam.createdBy ? exam.createdBy.fullName : 'Unknown',
                    teacherId: exam.teacherId
                };
            })
        );

        console.log('Fetched exams with teacherId:', examsWithQuestionCount.length);
        res.json(examsWithQuestionCount);
    } catch (error) {
        console.error('Get exams error:', error);
        next(error);
    }
};

// Updated createExam function
const createExam = async (req, res, next) => {
    try {
        const { title, description, duration, status, teacherId } = req.body;
        console.log('Creating exam:', { title, duration, status, teacherId });
        console.log('Request user:', req.user);

        // Validation
        if (!title || !duration) {
            return res.status(400).json({ message: 'Title and duration are required' });
        }

        const exam = new Exam({
            title,
            description: description || '',
            duration: parseInt(duration),
            status: status || 'draft',
            teacherId: teacherId || req.user.teacherId,
            createdBy: req.user.userId
        });

        const savedExam = await exam.save();
        console.log('Exam created successfully:', savedExam._id);

        res.status(201).json({
            message: 'Exam created successfully',
            exam: {
                id: savedExam._id,
                title: savedExam.title,
                description: savedExam.description,
                duration: savedExam.duration,
                status: savedExam.status,
                questionCount: 0,
                createdAt: savedExam.createdAt,
                teacherId: savedExam.teacherId
            }
        });

    } catch (error) {
        console.error('Create exam error:', error);
        next(error);
    }
};

// Updated updateExam function
const updateExam = async (req, res, next) => {
    try {
        const { title, description, duration, status, teacherId } = req.body;
        const examId = req.params.id;
        console.log('Updating exam:', examId, { title, duration, status, teacherId });

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Update exam fields
        if (title) exam.title = title;
        if (description !== undefined) exam.description = description;
        if (duration) exam.duration = parseInt(duration);
        if (status) exam.status = status;
        if (teacherId !== undefined) exam.teacherId = teacherId;

        const updatedExam = await exam.save();
        const questionCount = await Question.countDocuments({ examId: exam._id });

        console.log('Exam updated successfully:', updatedExam._id);

        res.json({
            message: 'Exam updated successfully',
            exam: {
                id: updatedExam._id,
                title: updatedExam.title,
                description: updatedExam.description,
                duration: updatedExam.duration,
                status: updatedExam.status,
                questionCount: questionCount,
                createdAt: updatedExam.createdAt,
                teacherId: updatedExam.teacherId
            }
        });

    } catch (error) {
        console.error('Update exam error:', error);
        next(error);
    }
};

// Updated deleteExam function
const deleteExam = async (req, res, next) => {
    try {
        const examId = req.params.id;
        const { teacherId } = req.query;
        console.log('Deleting exam:', examId, { teacherId });

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Delete all questions associated with this exam
        await Question.deleteMany({ examId: examId });
        console.log('Deleted questions for exam:', examId);

        // Delete the exam
        await Exam.findByIdAndDelete(examId);
        console.log('Exam deleted successfully:', examId);

        res.json({ message: 'Exam deleted successfully' });

    } catch (error) {
        console.error('Delete exam error:', error);
        next(error);
    }
};

// Updated getExamById function
const getExamById = async (req, res, next) => {
    try {
        const examId = req.params.id;
        const { teacherId } = req.query;
        
        let filter = { _id: examId };
        if (teacherId) filter.teacherId = teacherId;
        
        const exam = await Exam.findOne(filter).populate('createdBy', 'fullName');
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const questionCount = await Question.countDocuments({ examId: exam._id });
        
        res.json({
            id: exam._id,
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            status: exam.status,
            questionCount: questionCount,
            createdAt: exam.createdAt,
            createdBy: exam.createdBy ? exam.createdBy.fullName : 'Unknown',
            teacherId: exam.teacherId
        });
    } catch (error) {
        console.error('Get exam by ID error:', error);
        next(error);
    }
};

// Updated getExamsByContext function - now getExamsByTeacher
const getExamsByTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        console.log('Fetching exams for teacherId:', teacherId);

        const filter = { teacherId };

        const exams = await Exam.find(filter)
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        const examsWithQuestionCount = await Promise.all(
            exams.map(async (exam) => {
                const questionCount = await Question.countDocuments({ examId: exam._id });
                return {
                    id: exam._id,
                    title: exam.title,
                    description: exam.description,
                    duration: exam.duration,
                    status: exam.status,
                    questionCount: questionCount,
                    createdAt: exam.createdAt,
                    createdBy: exam.createdBy ? exam.createdBy.fullName : 'Unknown',
                    teacherId: exam.teacherId
                };
            })
        );

        res.json(examsWithQuestionCount);
    } catch (error) {
        console.error('Get exams by teacher error:', error);
        next(error);
    }
};

// Get exams by specific context (helper function)
const getExamsByContext = async (req, res, next) => {
    try {
        const { collegeId, branch } = req.params;
        console.log('Fetching exams for context:', { collegeId, branch });

        const filter = {};
        if (collegeId && collegeId !== 'all') filter.collegeId = collegeId;
        if (branch && branch !== 'all') filter.branch = branch;

        const exams = await Exam.find(filter)
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        const examsWithQuestionCount = await Promise.all(
            exams.map(async (exam) => {
                const questionCount = await Question.countDocuments({ examId: exam._id });
                return {
                    id: exam._id,
                    title: exam.title,
                    description: exam.description,
                    category: exam.category,
                    duration: exam.duration,
                    status: exam.status,
                    questionCount: questionCount,
                    createdAt: exam.createdAt,
                    createdBy: exam.createdBy ? exam.createdBy.fullName : 'Unknown',
                    collegeId: exam.collegeId,
                    branch: exam.branch
                };
            })
        );

        res.json(examsWithQuestionCount);
    } catch (error) {
        console.error('Get exams by context error:', error);
        next(error);
    }
};

module.exports = {
    getAllExams,
    createExam,
    updateExam,
    deleteExam,
    getExamById,
    getExamsByTeacher,
    getExamsByContext
};
