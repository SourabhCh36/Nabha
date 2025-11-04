/*const express = require('express');
const { LectureController, upload } = require('../controllers/lectureController');
const router = express.Router();

// Upload video lecture
router.post('/upload', upload.single('video'), LectureController.uploadLecture);

// Get all lectures for a teacher
router.get('/teacher/:teacherId', LectureController.getTeacherLectures);

// Update lecture
router.put('/:id', LectureController.updateLecture);

// Delete lecture
router.delete('/:id', LectureController.deleteLecture);

module.exports = router;*/
const express = require('express');
const { LectureController, upload } = require('../controllers/lectureController');
const router = express.Router();

/*/ Upload video lecture
router.post('/upload', upload.single('video'), LectureController.uploadLecture);*/
router.post('/upload', LectureController.handleUpload, LectureController.uploadLecture);
// Get all lectures for a teacher
router.get('/teacher/:teacherId', LectureController.getTeacherLectures);

// Add this new route to get a single lecture by ID
router.get('/:id', LectureController.getLectureById);

// Update lecture
router.put('/:id', LectureController.updateLecture);

// Delete lecture
router.delete('/:id', LectureController.deleteLecture);
router.put('/:id/view', LectureController.incrementViewCount);

module.exports = router;