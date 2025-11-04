// Question Management System
// Wait for DOM to be ready before initializing

let currentExamIdForQuestions = null;
let currentQuestionId = null;
let questions = [];

// Token is already defined in manage-exam.js, no need to redefine
// const token = localStorage.getItem('token');

console.log('manage-questions.js loaded');

// Open questions modal for an exam
function openQuestionsModal(examId) {
    console.log('openQuestionsModal called with:', examId);
    console.log('Opening questions modal for exam:', examId);
    if (!examId) {
        console.error('Error: Exam ID is missing');
        if (typeof showError === 'function') {
            showError('Error: Exam ID is missing');
        } else {
            alert('Error: Exam ID is missing');
        }
        return;
    }
    
    currentExamIdForQuestions = examId;
    loadQuestions(examId);
    
    try {
        const modal = new bootstrap.Modal(document.getElementById('questionModal'));
        modal.show();
    } catch (err) {
        console.error('Error opening modal:', err);
        alert('Error opening questions modal');
    }
}

// Load questions for an exam
async function loadQuestions(examId) {
    try {
        console.log('Loading questions for exam:', examId);
        const res = await fetch(`/api/exams/${examId}/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            console.warn('Questions not found or error:', res.status);
            questions = [];
            displayQuestions([]);
            return;
        }
        
        questions = await res.json();
        console.log('Loaded questions:', questions);
        if (typeof displayQuestions === 'function') {
            displayQuestions(questions);
        }
    } catch (err) {
        console.error('Error loading questions:', err);
        if (typeof showError === 'function') {
            showError('Failed to load questions: ' + err.message);
        } else {
            alert('Failed to load questions: ' + err.message);
        }
    }
}

// Display questions list
function displayQuestions(questionsList) {
    const questionsList_elem = document.getElementById('questionsList');
    questionsList_elem.innerHTML = '';
    
    if (!questionsList || questionsList.length === 0) {
        questionsList_elem.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>No questions added yet. Click "Add New Question" to create one.
            </div>
        `;
        return;
    }
    
    questionsList.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card mb-3 border-left-primary';
        const marksDisplay = question.marks ? `<span class="badge bg-info"><i class="fas fa-star me-1"></i>${question.marks} Points</span>` : '';
        questionDiv.innerHTML = `
            <div class="card-body">
                <div class="row">
                    <div class="col-md-10">
                        <h6 class="card-title">Question ${index + 1} ${marksDisplay}</h6>
                        <p class="card-text"><strong>Type:</strong> ${question.type}</p>
                        ${question.text ? `<p class="card-text"><strong>Text:</strong> ${question.text.substring(0, 100)}...</p>` : ''}
                        ${question.options && question.options.length > 0 ? `
                            <p class="card-text"><strong>Options:</strong> ${question.options.length}</p>
                        ` : ''}
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-sm btn-warning me-1" onclick="editQuestion('${question._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteQuestion('${question._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        questionsList_elem.appendChild(questionDiv);
    });
}

// Add new question
function addNewQuestion() {
    console.log('Adding new question');
    currentQuestionId = null;
    document.getElementById('questionForm').reset();
    document.getElementById('addQuestionCard').style.display = 'block';
    
    // Show text method by default
    document.getElementById('methodText').checked = true;
    document.getElementById('textQuestionContainer').style.display = 'block';
    document.getElementById('photoQuestionContainer').style.display = 'none';
    
    // Reset options
    updateOptionsDisplay('multiple-choice');
}

// Cancel adding question
function cancelAddQuestion() {
    document.getElementById('addQuestionCard').style.display = 'none';
    document.getElementById('questionForm').reset();
}

// Save question
async function saveQuestion() {
    const questionTextElem = document.getElementById('questionText');
    const questionTypeElem = document.getElementById('questionType');
    const questionMarksElem = document.getElementById('questionMarks');
    
    if (!questionTextElem || !questionTypeElem || !questionMarksElem) {
        console.error('Form elements not found');
        alert('Form elements not found. Please refresh the page.');
        return;
    }
    
    const questionText = questionTextElem.value.trim();
    const questionType = questionTypeElem.value;
    const questionMarks = parseInt(questionMarksElem.value) || 1;
    
    if (!questionText || !questionType) {
        if (typeof showError === 'function') {
            showError('Please fill in question text and select a type');
        } else {
            alert('Please fill in question text and select a type');
        }
        return;
    }
    
    if (questionMarks < 1 || questionMarks > 100) {
        if (typeof showError === 'function') {
            showError('Marks must be between 1 and 100');
        } else {
            alert('Marks must be between 1 and 100');
        }
        return;
    }
    
    if (!currentExamIdForQuestions) {
        if (typeof showError === 'function') {
            showError('Error: Exam ID is missing');
        } else {
            alert('Error: Exam ID is missing');
        }
        return;
    }
    
    let questionData = {
        text: questionText,
        type: questionType,
        marks: questionMarks,
        examId: currentExamIdForQuestions
    };
    
    // Add options based on question type
    if (questionType === 'multiple-choice') {
        const options = [];
        const correctAnswer = document.querySelector('input[name="correctOption"]:checked');
        
        document.querySelectorAll('.option-input').forEach((input, index) => {
            if (input.value.trim()) {
                options.push({
                    text: input.value.trim(),
                    isCorrect: correctAnswer && correctAnswer.value == index
                });
            }
        });
        
        if (options.length < 2) {
            showError('Please add at least 2 options');
            return;
        }
        
        questionData.options = options;
    } else if (questionType === 'true-false') {
        const correctAnswer = document.querySelector('input[name="trueFalseAnswer"]:checked');
        if (!correctAnswer) {
            showError('Please select the correct answer');
            return;
        }
        questionData.correctAnswer = correctAnswer.value === 'true';
    }
    
    try {
        let url = '/api/questions';
        let method = 'POST';
        
        if (currentQuestionId) {
            url = `/api/questions/${currentQuestionId}`;
            method = 'PUT';
        }
        
        console.log('Saving question:', questionData);
        
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(questionData)
        });
        
        if (!res.ok) {
            const errData = await res.json();
            console.error('Error response:', errData);
            throw new Error(errData.message || 'Failed to save question');
        }
        
        showSuccess(currentQuestionId ? 'Question updated successfully!' : 'Question added successfully!');
        cancelAddQuestion();
        loadQuestions(currentExamIdForQuestions);
    } catch (err) {
        showError(err.message);
    }
}

// Edit question
async function editQuestion(questionId) {
    try {
        console.log('Editing question:', questionId);
        const res = await fetch(`/api/questions/${questionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch question');
        const question = await res.json();
        
        currentQuestionId = questionId;
        document.getElementById('questionText').value = question.text;
        document.getElementById('questionType').value = question.type;
        document.getElementById('questionMarks').value = question.marks || 1;
        
        // Display form
        document.getElementById('addQuestionCard').style.display = 'block';
        
        // Update options display based on type
        updateOptionsDisplay(question.type);
        
        // Fill in options if available
        if (question.options && question.options.length > 0) {
            question.options.forEach((option, index) => {
                const input = document.querySelector(`.option-input[data-index="${index}"]`);
                if (input) {
                    input.value = option.text;
                    const correctRadio = document.querySelector(`input[name="correctOption"][value="${index}"]`);
                    if (correctRadio && option.isCorrect) {
                        correctRadio.checked = true;
                    }
                }
            });
        }
        
        // Scroll to form
        document.getElementById('addQuestionCard').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showError(err.message);
    }
}

// Delete question
async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
        console.log('Deleting question:', questionId);
        const res = await fetch(`/api/questions/${questionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to delete question');
        
        showSuccess('Question deleted successfully!');
        loadQuestions(currentExamIdForQuestions);
    } catch (err) {
        showError(err.message);
    }
}

// Update question type display
function updateOptionsDisplay(type) {
    console.log('updateOptionsDisplay called with type:', type);
    
    const optionsContainerDiv = document.getElementById('optionsContainer');
    const optionsList = document.getElementById('optionsList');
    
    if (!optionsContainerDiv || !optionsList) {
        console.warn('Options container elements not found');
        return;
    }
    
    optionsList.innerHTML = '';
    
    if (type === 'multiple-choice') {
        console.log('Setting up multiple choice options');
        optionsContainerDiv.style.display = 'block';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'col-12 mb-3';
        header.innerHTML = `
            <label class="form-label">Enter Options (Select one as correct):</label>
        `;
        optionsList.appendChild(header);
        
        // Add 4 option inputs
        for (let i = 0; i < 4; i++) {
            const div = document.createElement('div');
            div.className = 'col-md-6 mb-2';
            div.innerHTML = `
                <div class="input-group">
                    <div class="input-group-text">
                        <input type="radio" class="form-check-input mt-0" name="correctOption" id="option${i}" value="${i}">
                    </div>
                    <input type="text" class="form-control option-input" data-index="${i}" placeholder="Option ${i + 1}">
                </div>
                <small class="form-text text-muted">Click radio to mark as correct</small>
            `;
            optionsList.appendChild(div);
        }
    } else if (type === 'true-false') {
        console.log('Setting up true/false options');
        optionsContainerDiv.style.display = 'block';
        
        const div = document.createElement('div');
        div.className = 'col-12';
        div.innerHTML = `
            <label class="form-label mb-3">Select Correct Answer:</label>
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="trueFalseAnswer" id="answerTrue" value="true">
                <label class="form-check-label" for="answerTrue">
                    <strong>True</strong>
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="trueFalseAnswer" id="answerFalse" value="false">
                <label class="form-check-label" for="answerFalse">
                    <strong>False</strong>
                </label>
            </div>
        `;
        optionsList.appendChild(div);
    } else if (type === 'descriptive') {
        console.log('Descriptive question - no options needed');
        optionsContainerDiv.style.display = 'none';
    } else {
        console.log('No type selected');
        optionsContainerDiv.style.display = 'none';
    }
}

// Update options display when type changes
document.addEventListener('DOMContentLoaded', function() {
    const questionTypeSelect = document.getElementById('questionType');
    if (questionTypeSelect) {
        questionTypeSelect.addEventListener('change', function() {
            updateOptionsDisplay(this.value);
        });
    }
});

// Make functions globally available
window.openQuestionsModal = openQuestionsModal;
window.addNewQuestion = addNewQuestion;
window.saveQuestion = saveQuestion;
window.cancelAddQuestion = cancelAddQuestion;
window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;

console.log('Question management functions registered globally');
