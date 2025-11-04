// Student Exams List JavaScript
const token = localStorage.getItem('token');
let allExams = [];

// Load exams on page load
async function loadExams() {
    try {
        console.log('Loading exams for student...');
        
        const res = await fetch('/api/exams', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch exams');
        }

        allExams = await res.json();
        console.log('Loaded exams:', allExams);

        displayExams(allExams);
        document.getElementById('loadingState').style.display = 'none';

    } catch (error) {
        console.error('Error loading exams:', error);
        document.getElementById('loadingState').style.display = 'none';
        showError('Failed to load exams: ' + error.message);
    }
}

// Display exams in grid
function displayExams(exams) {
    const container = document.getElementById('examsContainer');
    const noExamsMsg = document.getElementById('noExamsMessage');

    if (!exams || exams.length === 0) {
        container.style.display = 'none';
        noExamsMsg.style.display = 'block';
        return;
    }

    container.innerHTML = '';
    container.style.display = 'grid';
    noExamsMsg.style.display = 'none';

    exams.forEach(exam => {
        const examId = exam._id || exam.id;
        const card = document.createElement('div');
        card.className = 'exam-card';

        // Status badge
        let statusBadge = '';
        if (exam.status === 'active') {
            statusBadge = '<span class="badge-status badge-active">✓ Active</span>';
        } else if (exam.status === 'draft') {
            statusBadge = '<span class="badge-status badge-draft">📝 Draft</span>';
        } else {
            statusBadge = '<span class="badge-status badge-inactive">✕ Inactive</span>';
        }

        // Determine if exam can be taken
        const canTake = exam.status === 'active';

        card.innerHTML = `
            ${statusBadge}
            <div class="exam-title">${exam.title}</div>
            <p class="exam-description">${exam.description || 'No description provided'}</p>
            
            <div class="exam-meta">
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span><strong>${exam.duration}</strong> minutes</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-list"></i>
                    <span><strong>${exam.questionCount || 0}</strong> questions</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(exam.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <button class="btn-start" 
                    onclick="startExam('${examId}')" 
                    ${!canTake ? 'disabled' : ''}>
                ${canTake ? '<i class="fas fa-play me-2"></i>Start Exam' : 'Not Available'}
            </button>
        `;

        container.appendChild(card);
    });
}

// Start exam
function startExam(examId) {
    console.log('Starting exam:', examId);
    window.location.href = `/student-quiz?examId=${examId}`;
}

// Search exams
function searchExams() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allExams.filter(exam => 
        exam.title.toLowerCase().includes(searchTerm) ||
        (exam.description && exam.description.toLowerCase().includes(searchTerm))
    );
    displayExams(filtered);
}

// Refresh exams
function refreshExams() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('examsContainer').style.display = 'none';
    document.getElementById('noExamsMessage').style.display = 'none';
    loadExams();
}

// Show error
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    loadExams();
});
