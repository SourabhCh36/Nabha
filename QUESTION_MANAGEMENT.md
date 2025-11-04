# Question Management System - Complete Guide

## Overview
Added complete question management functionality to exams. Teachers can now create, edit, and delete questions for each exam with support for multiple question types.

## Features Added

### 1. **View Questions**
- Click "Questions" button on any exam card
- Opens a modal showing all questions for that exam
- Displays question type and preview text

### 2. **Create Questions**
- Click "Add New Question" in the questions modal
- Support for 3 question types:
  - **Multiple Choice**: Up to 4 options with one correct answer
  - **True/False**: Binary choice question
  - **Descriptive**: Open-ended question

### 3. **Edit Questions**
- Click "Edit" on any question card
- Modify question text, type, and options
- Save changes automatically

### 4. **Delete Questions**
- Click "Delete" on any question card
- Confirmation dialog prevents accidental deletion

## Files Created/Modified

### New Files:
- `shared/manage-questions.js` - Question management logic
- `routes/questionRoutes.js` - Backend API routes for questions

### Modified Files:
- `view/manage-exam.html` - Added questions script reference
- `shared/manage-exam.js` - Added "Questions" button to exam cards
- `routes/index.js` - Enabled question routes
- `routes/examRoutes.js` - Added exam-questions endpoint

### Used Existing:
- `models/Question.js` - Question schema
- `models/index.js` - Already exports Question

## API Endpoints

### Get Questions for Exam
```
GET /api/exams/:examId/questions
Authorization: Bearer {token}
```

### Get Single Question
```
GET /api/questions/:id
Authorization: Bearer {token}
```

### Create Question
```
POST /api/questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "What is 2+2?",
  "type": "multiple-choice",
  "examId": "exam-id",
  "options": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true },
    { "text": "5", "isCorrect": false }
  ]
}
```

### Update Question
```
PUT /api/questions/:id
Authorization: Bearer {token}
Content-Type: application/json
(same payload as create)
```

### Delete Question
```
DELETE /api/questions/:id
Authorization: Bearer {token}
```

## Question Types

### Multiple Choice
- Up to 4 options
- One correct answer marked as `isCorrect: true`
- Minimum 2 options required

### True/False
- Two automatic options: "True" and "False"
- Specify correct answer: `correctAnswer: true` or `correctAnswer: false`

### Descriptive
- Open-ended question
- Students provide written answers
- No preset options

## UI Elements

### Exam Card Updates
Each exam now displays:
- Number of questions added
- Creation date
- Three action buttons:
  - **Questions** (green) - Manage questions for this exam
  - **Edit** (blue) - Edit exam details
  - **Delete** (red) - Delete exam

### Question Modal
- List of all questions with:
  - Question number
  - Question type
  - Preview text (first 100 chars)
  - Edit/Delete buttons
- "Add New Question" button at top
- Collapsible form for creating/editing questions

## How to Use

### Add Questions to an Exam
1. Click on an exam card
2. Click the green "Questions" button
3. Click "Add New Question"
4. Select question type
5. Enter question text
6. For multiple choice: Add options and select correct answer
7. For true/false: Select the correct answer
8. Click "Save Question"

### Edit a Question
1. Open exam's questions modal
2. Click "Edit" on the question
3. Modify the question details
4. Click "Save Question" (button changes from "Save" to "Update")

### Delete a Question
1. Open exam's questions modal
2. Click "Delete" on the question
3. Confirm deletion in the prompt

## Browser Console Logging

The system logs important events to console for debugging:
```
Opening questions modal for exam: [exam-id]
Loading questions for exam: [exam-id]
Loaded questions: [count]
Adding new question
Creating question with payload: [data]
Response status: 201
Question created successfully
```

Check browser DevTools (F12) → Console for troubleshooting.

## Database Schema

Questions are stored with:
- `examId` - Reference to the exam
- `text` - Question text/content
- `type` - Question type (multiple-choice, true-false, descriptive)
- `options` - Array of answer options
- `correctAnswer` - Index of correct option
- `timestamps` - createdAt, updatedAt

## Troubleshooting

### Questions not loading
1. Check browser console for errors (F12)
2. Verify exam ID is valid
3. Ensure you're authenticated (token in localStorage)

### Can't save question
- Check all required fields are filled
- For multiple choice: Need at least 2 options
- True/False: Must select correct answer
- Check browser console for error details

### Exam question count not updating
- Click "Refresh" button to reload exam list
- Question count is shown next to exam details

## Next Steps

You can now:
1. Add multiple questions to exams
2. Create different question types
3. Edit questions before exam starts
4. Delete questions as needed
5. (Future) Create question banks for reuse
6. (Future) Add question difficulty levels
7. (Future) Add question tags/categories
