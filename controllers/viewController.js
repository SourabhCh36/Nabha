const { get } = require('http');
const path = require('path');

const getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'fronttry.html'));
};



// Serve registration page
/*const getRegisterPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'register.html'));
};*/

const getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'logintry.html'));
};
const getLoginPageT = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'logintryT.html'));
};
/*const getRegisterPageT = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'registerT.html'));
};*/
const getMangeExamPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'manage-exam.html'));
};

// Serve student dashboard
const getStudentDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'student-dashboard.html'));
};

// Serve admin dashboard
const getAdminDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'admin-dashboardtry.html'));
};
const getAdminAnalyticsPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'admin-analysis.html'));
}
const getStudentAnalyticsPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'student-analysis.html'));
}
const getlecturePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'lecture.html'));
}
const getLeaderboardPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'leader-board.html'));
}
const getQuizpage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'level.html'));
} 
const getExamPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'adminExam.html'));
}
const getEscapeHtml = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'escape.html'));
}
const getGameN02 = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'index.html'));
}
const getGameN03 = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'start.html'));
}
const getModule1 = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'module.html'));
}
const getLevel1= (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'defaultlevel.html'));
}
const getparentpage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'parent.html'));
}
// Export all view handlers
module.exports={
  getHomePage,
  getLoginPage,
  getLoginPageT,
  getStudentDashboard,
  getMangeExamPage,
  getAdminAnalyticsPage,
  getQuizpage,
  getStudentAnalyticsPage,
  getlecturePage,
  getLeaderboardPage,
  getExamPage,
    getEscapeHtml, 
    getGameN02,
    getGameN03,
    getModule1,
    getLevel1,
    getparentpage,
  getAdminDashboard
}