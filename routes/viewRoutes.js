const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
// Home page
router.get('/', viewController.getHomePage);

router.get('/logintry', viewController.getLoginPage);
/*router.get('/login', viewController.getLoginPage);
/*router.get('/registerT', viewController.getRegisterPageT);*/
router.get('/logintryT', viewController.getLoginPageT);
// Student dashboard
router.get('/student-dashboard',viewController.getStudentDashboard);
// Admin dashboard
router.get('/admin-dashboardtry', viewController.getAdminDashboard);
router.get('/manage-exam', viewController.getMangeExamPage);
router.get('/leader-board' , viewController.getLeaderboardPage);
router.get('/student-analysis'  , viewController.getStudentAnalyticsPage);
router.get('/quiz-level', viewController.getQuizpage);
router.get('/exam-admin', viewController.getExamPage);
router.get('/lecture', viewController.getlecturePage);
router.get('/module1', viewController.getModule1);
router.get('/admin-analysis', viewController.getAdminAnalyticsPage);
router.get('/escape', viewController.getEscapeHtml);
router.get('/gameNO2', viewController.getGameN02);
router.get('/gameNO3', viewController.getGameN03);
router.get('/defaultlevel', viewController.getLevel1)
router.get('/parent', viewController.getparentpage)
// Student exam pages
router.get('/student-exams', (req, res) => {
    res.sendFile(require('path').join(__dirname, '../view/student-exams.html'));
});
router.get('/student-quiz', (req, res) => {
    res.sendFile(require('path').join(__dirname, '../view/student-quiz.html'));
});
module.exports = router;
