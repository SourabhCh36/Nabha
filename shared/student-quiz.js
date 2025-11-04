// Student Quiz JavaScript
const token = localStorage.getItem('token');
let currentExamId = new URLSearchParams(window.location.search).get('examId');
let allQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let quizStartTime;
let quizDuration = 0;
let timerInterval;

// Initialize quiz
async function initializeQuiz() {
    console.log('Initializing quiz with examId:', currentExamId);
    
    if (!currentExamId) {
        showError('No exam selected. Please go back and select an exam.');
        return;
    }

    if (!token) {
        showError('Not authenticated. Please login first.');
        return;
    }

    try {
        // Fetch exam details
        const examRes = await fetch(`/api/exams/${currentExamId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!examRes.ok) {
            throw new Error('Failed to load exam');
        }

        const exam = await examRes.json();
        document.getElementById('quizTitle').textContent = exam.title;
        quizDuration = exam.duration * 60; // Convert to seconds

        // Fetch questions
        const questionsRes = await fetch(`/api/exams/${currentExamId}/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!questionsRes.ok) {
            throw new Error('Failed to load questions');
        }

        allQuestions = await questionsRes.json();

        if (allQuestions.length === 0) {
            throw new Error('No questions found in this exam');
        }

        console.log('Loaded questions:', allQuestions.length);

        // Initialize UI
        document.getElementById('totalQuestions').textContent = allQuestions.length;
        document.getElementById('qTotal').textContent = allQuestions.length;
        
        // Start quiz
        quizStartTime = Date.now();
        startTimer();
        showQuestion(0);
        
        // Hide loading, show quiz
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('quizState').style.display = 'block';

    } catch (error) {
        console.error('Error initializing quiz:', error);
        showError(error.message);
    }
}

// Display current question
function showQuestion(index) {
    currentQuestionIndex = index;
    const question = allQuestions[index];

    // Update progress
    document.getElementById('currentQuestion').textContent = index + 1;
    document.getElementById('qNum').textContent = index + 1;
    const progressPercent = ((index + 1) / allQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';

    // Show question text
    document.getElementById('questionText').textContent = question.text;

    // Render options based on question type
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    if (question.type === 'multiple-choice') {
        renderMultipleChoice(question, optionsContainer);
    } else if (question.type === 'true-false') {
        renderTrueFalse(question, optionsContainer);
    } else if (question.type === 'descriptive') {
        renderDescriptive(question, optionsContainer);
    }

    // Update button visibility
    updateNavigationButtons();
}

// Render multiple choice options
function renderMultipleChoice(question, container) {
    const div = document.createElement('div');
    div.className = 'question-options';

    question.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'option';
        
        const isSelected = userAnswers[question._id] === index;
        if (isSelected) {
            label.classList.add('selected');
        }

        label.innerHTML = `
            <input type="radio" name="answer_${question._id}" value="${index}" 
                   ${isSelected ? 'checked' : ''} 
                   onchange="saveAnswer('${question._id}', ${index})">
            <span>${option}</span>
        `;
        div.appendChild(label);
    });

    container.appendChild(div);
}

// Render true/false options
function renderTrueFalse(question, container) {
    const div = document.createElement('div');
    div.className = 'question-options';

    ['True', 'False'].forEach((value, index) => {
        const label = document.createElement('label');
        label.className = 'option';
        
        const isSelected = userAnswers[question._id] === index;
        if (isSelected) {
            label.classList.add('selected');
        }

        label.innerHTML = `
            <input type="radio" name="answer_${question._id}" value="${index}" 
                   ${isSelected ? 'checked' : ''} 
                   onchange="saveAnswer('${question._id}', ${index})">
            <span>${value}</span>
        `;
        div.appendChild(label);
    });

    container.appendChild(div);
}

// Render descriptive answer
function renderDescriptive(question, container) {
    const textarea = document.createElement('textarea');
    textarea.className = 'descriptive-answer';
    textarea.placeholder = 'Enter your answer here...';
    textarea.value = userAnswers[question._id] || '';
    textarea.onchange = () => {
        saveAnswer(question._id, textarea.value);
    };
    container.appendChild(textarea);
}

// Save user answer
function saveAnswer(questionId, answer) {
    userAnswers[questionId] = answer;
    console.log('Answer saved:', questionId, answer);
}

// Next question
function nextQuestion() {
    if (currentQuestionIndex < allQuestions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
        window.scrollTo(0, 0);
    }
}

// Previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
        window.scrollTo(0, 0);
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    
    if (currentQuestionIndex < allQuestions.length - 1) {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    }
}

// Start timer
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
        const remainingSeconds = Math.max(0, quizDuration - elapsedSeconds);

        updateTimerDisplay(remainingSeconds);

        if (remainingSeconds === 0) {
            clearInterval(timerInterval);
            autoSubmitQuiz();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay(remainingSeconds = quizDuration) {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const timerElement = document.getElementById('timer');
    
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Add warning if less than 5 minutes
    if (remainingSeconds < 300) {
        timerElement.classList.add('timer-warning');
    }
}

// Submit quiz
async function submitQuiz() {
    if (!confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
        return;
    }

    clearInterval(timerInterval);
    await finalizeQuiz();
}

// Auto submit if time runs out
async function autoSubmitQuiz() {
    alert('Time is up! Your quiz will be submitted automatically.');
    await finalizeQuiz();
}

// Finalize and submit quiz
async function finalizeQuiz() {
    try {
        // Calculate answers in the format backend expects
        const answers = allQuestions.map((question) => ({
            questionId: question._id,
            userAnswer: userAnswers[question._id] || null,
            questionType: question.type
        }));

        const payload = {
            examId: currentExamId,
            answers: answers,
            submittedAt: new Date().toISOString()
        };

        console.log('Submitting quiz:', payload);

        const res = await fetch('/api/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to submit quiz');
        }

        const result = await res.json();
        console.log('Quiz submitted successfully:', result);

        // Show finish screen
        document.getElementById('quizState').style.display = 'none';
        document.getElementById('finishState').style.display = 'block';
        
        const finishMessage = document.getElementById('finishMessage');
        if (result.score !== undefined) {
            finishMessage.textContent = `Your Score: ${result.score} / ${allQuestions.length}`;
        } else {
            finishMessage.textContent = 'Your quiz has been submitted successfully. Your score will be calculated by the teacher.';
        }

    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz: ' + error.message);
    }
}

// Show error
function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

// Go back
function goBack() {
    history.back();
}

// Go to exam list
function goToExamList() {
    window.location.href = '/student-exams';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeQuiz);
