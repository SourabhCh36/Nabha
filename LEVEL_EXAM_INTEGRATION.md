# Level-Based Exam Integration

## Overview
Exams created by teachers are now integrated directly into `level.html` and organized by levels (1-10), replacing the separate exam pages approach.

## How It Works

### 1. Backend Exam Loading (`loadExamsFromBackend()`)
- Fetches all exams from `/api/exams` when page loads
- Stores exams in `backendExams` array
- Calls `organizeLevelExams()` to distribute exams across levels

### 2. Level Organization (`organizeLevelExams()`)
- Initializes `levelExams` object with levels 1-10
- Adds hardcoded candy exams to their respective levels (levels 1-3)
- Distributes backend exams evenly across 10 levels using round-robin: `level = (index % 10) + 1`
- Each level can have multiple exams (candy + backend)

### 3. Level Exam Start (`startLevelExam(level)`)
When a student clicks a level:
- Shows **no exam message** if level has no exams
- **Starts exam directly** if level has 1 exam
- **Shows exam selection UI** if level has multiple exams

### 4. Exam Selection UI (`showExamSelection()`)
- Displays all available exams for the level
- Shows duration, question count, and exam title
- Interactive cards with hover effects
- Students click to select and start

### 5. Exam Types

#### Candy Exams (`startCandyExam()`)
- One question at a time interface
- No timer (optional hardcoded 5 min)
- Manual "Next Question" button
- Shows results screen with pass/fail
- Unlocks next level if passed (50% threshold)

#### Backend Exams (`startBackendExam()`)
- Loads questions from `/api/exams/{examId}/questions`
- All questions displayed at once
- Timer countdown with auto-submit on timeout
- Supports 3 question types:
  - **Multiple Choice**: Radio buttons for each option
  - **True/False**: Two radio button options
  - **Descriptive**: Text area for answers
- Submit button sends answers to `/api/results`
- Shows results with score and pass/fail
- Unlocks next level if passed (50% threshold)

### 6. Answer Handling
- **Candy answers**: Checked one-by-one during progression
- **Backend answers**: Saved as user selects each answer via `saveBackendAnswer()`
- Descriptive answers stored as text string
- Multiple choice answers stored as option index (0-3)

## File Structure

```
/view/level.html
├── Global variables (lines 530-540)
│   ├── backendExams[] - fetched exams
│   ├── levelExams{} - organized by level
│   └── currentExamData - current exam being taken
│
├── Initialization (lines 542-626)
│   └── DOMContentLoaded: calls loadExamsFromBackend()
│
├── Backend Integration (lines 628-1029)
│   ├── loadExamsFromBackend() - fetches from API
│   ├── organizeLevelExams() - distributes by level
│   ├── startLevelExam(level) - entry point
│   ├── startSpecificExam(exam) - routes to candy/backend
│   ├── startCandyExam(exam) - candy logic
│   ├── startBackendExam(exam) - backend logic
│   ├── renderBackendQuestions() - renders questions
│   ├── saveBackendAnswer() - saves answer
│   ├── submitBackendExam() - prepares submission
│   ├── submitToBackend() - sends to API
│   ├── showBackendResults() - displays results
│   ├── showExamSelection() - multi-exam selector
│   ├── showNoExamsMessage() - empty state
│   ├── showNoQuestionsMessage() - no questions state
│   └── showExamError() - error handling
│
├── Exam Display (lines 1031-1053)
│   └── submitExam() - routes submission (candy/backend)
│
└── Utilities (lines 1155-1275)
    ├── goBackToMap() - return to level map
    ├── startTimer() - countdown timer
    └── unlockNextLevel() - progression
```

## API Endpoints Used

1. **Get All Exams**: `GET /api/exams`
   - Headers: Authorization Bearer token
   - Returns: Array of exam objects with `_id`, `title`, `duration`, `description`, `questionCount`

2. **Get Exam Questions**: `GET /api/exams/{examId}/questions`
   - Headers: Authorization Bearer token
   - Returns: Array of question objects with `_id`, `text`, `type`, `options`

3. **Submit Exam**: `POST /api/results`
   - Headers: Authorization Bearer token, Content-Type: application/json
   - Body: `{ examId, answers: [{questionId, userAnswer, questionType}], submittedAt }`
   - Returns: `{ score, percentage, passed, ... }`

## Level Assignment Strategy

Currently exams are distributed **evenly across levels using round-robin**:
- 1st exam → Level 1
- 2nd exam → Level 2
- ...
- 11th exam → Level 1
- 12th exam → Level 2
- etc.

**To implement explicit level assignment**, add a `levelNumber` field to exams:
```javascript
backendExams.forEach((exam) => {
  const level = exam.levelNumber || 1; // Use explicit level or default to 1
  levelExams[level].push({ type: 'backend', ...exam });
});
```

## Candy Exams (Hardcoded)

Levels 1-3 have hardcoded candy exams:
- Level 1: Math (2+2=?) and Geography (Capital of France)
- Level 2: 4 Science questions (photosynthesis, boiling point, respiration, solar energy)
- Level 3: 2 History/Biology questions (light bulb inventor, fastest animal)

These are defined in the `levels` object and automatically added to `levelExams` during initialization.

## User Flow

```
1. Student logs in → localStorage token stored
2. Opens /level.html
3. loadExamsFromBackend() fetches exams and organizes by level
4. Student clicks level node
   ├─ If locked: show notification
   ├─ If no exams: show empty message
   ├─ If 1 exam: start it directly
   └─ If multiple: show selection UI
5. Student selects exam (or auto-starts single exam)
   ├─ Candy: one question at a time → submit → results
   └─ Backend: all questions with timer → submit → results
6. If passed (≥50%): next level unlocks via unlockNextLevel()
7. Student returns to map via goBackToMap()
```

## Features

✅ Level-based organization (1-10)
✅ Multiple exams per level support
✅ Auto-distribution of backend exams
✅ Candy exam support (hardcoded)
✅ Timer for backend exams
✅ Auto-submit on timeout
✅ Three question types (MC, TF, Descriptive)
✅ Answer tracking and submission
✅ Pass/fail determination (50% threshold)
✅ Level unlocking progression
✅ Error handling for missing questions
✅ Empty state messages

## Future Enhancements

1. Add `levelNumber` field to exam model for explicit assignment
2. Implement question preview in exam selection
3. Add exam retry limits
4. Store student exam history and analytics
5. Add difficulty ratings per level
6. Implement weighted scoring
7. Add exam categories/subjects per level
