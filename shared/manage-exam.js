// Get token from localStorage
const token = localStorage.getItem('token'); 

// Decode JWT to get user info
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (err) {
        console.error('Error decoding token:', err);
        return null;
    }
}

const decodedToken = decodeToken(token);
const currentTeacherId = decodedToken?.teacherId || decodedToken?.userId;

console.log('Decoded token:', decodedToken);
console.log('Current teacher ID:', currentTeacherId);

// Elements
const examsContainer = document.getElementById('examsContainer');
const noExamsMessage = document.getElementById('noExamsMessage');
const errorMessage = document.getElementById('errorMessage');
const loadingMessage = document.getElementById('loadingMessage');

// Track current exam being edited
let currentEditingExamId = null;

// Show error
function showError(msg) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = msg;
    setTimeout(() => errorMessage.style.display = 'none', 5000);
}

// Show success message
function showSuccess(msg) {
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success';
    successMessage.textContent = msg;
    successMessage.style.position = 'fixed';
    successMessage.style.top = '20px';
    successMessage.style.right = '20px';
    successMessage.style.zIndex = '9999';
    document.body.appendChild(successMessage);
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

// Fetch exams
async function fetchExams() {
    loadingMessage.style.display = 'block';
    examsContainer.style.display = 'none';
    noExamsMessage.style.display = 'none';

    try {
        const res = await fetch('/api/exams', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch exams');
        const exams = await res.json();
        loadingMessage.style.display = 'none';

        if (!exams || exams.length === 0) {
            noExamsMessage.style.display = 'block';
            return;
        }

        examsContainer.innerHTML = '';
        exams.forEach(exam => {
            // Handle both 'id' and '_id' from API response
            const examId = exam._id || exam.id;
            const div = document.createElement('div');
            div.classList.add('exam-card', 'card', 'mb-3');
            div.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${exam.title}</h5>
                    <p class="card-text">${exam.description || ''}</p>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><i class="fas fa-tag me-2"></i>Status: <span class="badge bg-${exam.status === 'active' ? 'success' : exam.status === 'draft' ? 'warning' : 'secondary'}">${exam.status}</span></p>
                            <p class="mb-1"><i class="fas fa-clock me-2"></i>Duration: ${exam.duration} mins</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><i class="fas fa-question-circle me-2"></i>Questions: ${exam.questionCount || 0}</p>
                            <p class="mb-1"><i class="fas fa-calendar me-2"></i>Created: ${new Date(exam.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <hr>
                    <div class="btn-group w-100" role="group">
                        <button class="btn btn-outline-success" onclick="openQuestionsModal('${examId}')">
                            <i class="fas fa-question-circle me-1"></i>Questions
                        </button>
                        <button class="btn btn-outline-primary" onclick="editExam('${examId}')">
                            <i class="fas fa-edit me-1"></i>Edit
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteExam('${examId}')">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            `;
            examsContainer.appendChild(div);
            console.log('Added exam card:', examId, exam.title);
        });

        examsContainer.style.display = 'grid';
    } catch (err) {
        loadingMessage.style.display = 'none';
        showError(err.message);
    }
}

// Create new exam
function createNewExam() {
    currentEditingExamId = null;
    // Reset form
    document.getElementById('examForm').reset();
    document.getElementById('examModalTitle').textContent = 'Create New Exam';
    document.querySelector('#examModal .btn-primary').textContent = '\uD83D\uDCBE Save Exam';
    document.querySelector('#examModal .btn-primary').onclick = saveExam;
    const examModal = new bootstrap.Modal(document.getElementById('examModal'));
    examModal.show();
}

// Refresh exams
function refreshExams() {
    fetchExams();
}

// Save exam (create or update)
async function saveExam() {
    const title = document.getElementById('examTitle').value.trim();
    const duration = parseInt(document.getElementById('examDuration').value);
    const status = document.getElementById('examStatus').value;
    const description = document.getElementById('examDescription').value;

    if (!title || !duration || !status) {
        showError('Please fill in all required fields');
        return;
    }

    if (duration <= 0) {
        showError('Duration must be greater than 0');
        return;
    }

    if (!currentTeacherId) {
        showError('Unable to create exam: Teacher ID not found. Please login again.');
        return;
    }

    const payload = { title, duration, status, description, teacherId: currentTeacherId };
    console.log('Sending payload:', payload);

    try {
        if (currentEditingExamId) {
            // Update exam
            const res = await fetch(`/api/exams/${currentEditingExamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error('Update error response:', errData);
                throw new Error(errData.message || 'Failed to update exam');
            }
            const respData = await res.json();
            console.log('Exam updated:', respData);
            showSuccess('Exam updated successfully!');
        } else {
            // Create new exam
            console.log('Creating exam with payload:', payload);
            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', res.status);
            
            if (!res.ok) {
                const errData = await res.json();
                console.error('Create error response:', errData);
                throw new Error(errData.message || `Failed to create exam (Status: ${res.status})`);
            }
            const respData = await res.json();
            console.log('Exam created:', respData);
            showSuccess('Exam created successfully!');
        }

        bootstrap.Modal.getInstance(document.getElementById('examModal')).hide();
        currentEditingExamId = null;
        fetchExams();
    } catch (err) {
        showError(err.message);
    }
}

// Delete exam
async function deleteExam(id) {
    console.log('Delete exam called with id:', id);
    if (!id) {
        showError('Error: Exam ID is missing');
        return;
    }
    const modalContent = `
        <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteTitle" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="confirmDeleteTitle">
                            <i class="fas fa-exclamation-triangle me-2"></i>Confirm Delete
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this exam? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                            <i class="fas fa-trash me-2"></i>Delete Exam
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove any existing modal
    const existingModal = document.getElementById('confirmDeleteModal');
    if (existingModal) existingModal.remove();

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalContent);
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));

    // Handle delete confirmation
    document.getElementById('confirmDeleteBtn').onclick = async function() {
        try {
            console.log('Confirming delete for exam id:', id);
            const res = await fetch(`/api/exams/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Delete response status:', res.status);
            if (!res.ok) {
                const errData = await res.json();
                console.error('Delete error:', errData);
                throw new Error(errData.message || 'Failed to delete exam');
            }
            bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
            showSuccess('Exam deleted successfully!');
            setTimeout(() => fetchExams(), 500);
        } catch (err) {
            showError(err.message);
        }
    };

    confirmDeleteModal.show();
}

// Edit exam
async function editExam(id) {
    console.log('Edit exam called with id:', id);
    if (!id) {
        showError('Error: Exam ID is missing');
        return;
    }
    try {
        console.log('Fetching exam details for id:', id);
        const res = await fetch(`/api/exams/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Get exam response status:', res.status);
        if (!res.ok) {
            const errData = await res.json();
            console.error('Get exam error:', errData);
            throw new Error('Failed to fetch exam details');
        }
        const exam = await res.json();
        console.log('Fetched exam data:', exam);

        currentEditingExamId = id;
        document.getElementById('examTitle').value = exam.title;
        document.getElementById('examDuration').value = exam.duration;
        document.getElementById('examStatus').value = exam.status;
        document.getElementById('examDescription').value = exam.description || '';
        document.getElementById('examModalTitle').textContent = 'Edit Exam';
        document.querySelector('#examModal .btn-primary').textContent = '\uD83D\uDCBE Update Exam';
        document.querySelector('#examModal .btn-primary').onclick = saveExam;

        const examModal = new bootstrap.Modal(document.getElementById('examModal'));
        examModal.show();
    } catch (err) {
        showError(err.message);
    }
}

// Search exams
document.getElementById('searchInput').addEventListener('input', function() {
    const search = this.value.toLowerCase();
    const cards = document.querySelectorAll('.exam-card');
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        card.style.display = title.includes(search) ? 'block' : 'none';
    });
});

// Character counter for exam description
document.getElementById('examDescription').addEventListener('input', function() {
    const charCount = document.getElementById('charCount');
    charCount.textContent = this.value.length + '/500 characters';
});

// Reset character counter on modal hide
document.getElementById('examModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('charCount').textContent = '0/500 characters';
});

// Initial load
fetchExams();
