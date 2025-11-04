# Exam Creation Troubleshooting Guide

## Fixed Issues

The exam creation wasn't working because:
1. **Missing teacherId** - The frontend wasn't extracting and sending the `teacherId` from the JWT token
2. **Backend requirement** - The Exam model requires `teacherId` to be present

## What Was Fixed

1. **Token Decoding** - Added JWT token decoder to extract `teacherId` and `userId` from the authentication token
2. **Payload Enhancement** - Now automatically includes `teacherId` in the POST request
3. **Error Logging** - Added console.log statements to help debug any remaining issues

## How to Test

### 1. Open Browser Developer Console
- Press `F12` (or `Cmd+Option+I` on Mac)
- Go to the **Console** tab

### 2. Create a Test Exam
1. Click "Create New Exam" button
2. Fill in the form:
   - **Title**: "Test Exam"
   - **Duration**: 30
   - **Status**: Select "Active" or "Draft"
   - **Description**: "This is a test exam"
3. Click "Save Exam"

### 3. Check Console Output
You should see logs like:
```
Decoded token: {userId: "...", teacherId: "...", ...}
Current teacher ID: "abc123xyz..."
Creating exam with payload: {title: "Test Exam", duration: 30, status: "active", description: "This is a test exam", teacherId: "abc123xyz..."}
Response status: 201
Exam created: {message: "Exam created successfully", exam: {...}}
```

## If It Still Doesn't Work

### Check These Logs:

1. **"Current teacher ID: null"** 
   - Problem: Token doesn't contain teacherId
   - Solution: Try logging out and logging back in

2. **"Response status: 403"** 
   - Problem: Permission denied - you're not logged in as a teacher
   - Solution: Login as a teacher account

3. **"Response status: 400"** 
   - Problem: Missing required fields
   - Make sure all fields are filled:
     - Title ✓
     - Duration ✓ (must be > 0)
     - Status ✓

4. **"Response status: 500"** 
   - Problem: Server error
   - Check backend logs for more details

## API Endpoint Details

**Endpoint**: `POST /api/exams`

**Required Headers**:
```
Authorization: Bearer {your-jwt-token}
Content-Type: application/json
```

**Required Body**:
```json
{
  "title": "Exam Title",
  "duration": 30,
  "status": "draft",
  "description": "Optional description",
  "teacherId": "teacher-id-from-token"
}
```

**Success Response (201)**:
```json
{
  "message": "Exam created successfully",
  "exam": {
    "id": "exam-id",
    "title": "Exam Title",
    "duration": 30,
    "status": "draft",
    "questionCount": 0,
    "createdAt": "2025-11-02T...",
    "teacherId": "teacher-id"
  }
}
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unable to create exam: Teacher ID not found" | Token doesn't have teacherId | Logout and login again |
| Green success but exam not showing | Exam list not refreshing | Click "Refresh" button |
| Nothing happens | API call failing silently | Check browser console (F12) |
| 403 Forbidden | Not authenticated as teacher | Login with teacher account |
| 400 Bad Request | Missing required fields | Fill all marked fields (*) |

## Next Steps if Still Having Issues

1. **Check Backend Server**:
   - Is the server running?
   - Are there any errors in the server logs?

2. **Verify Token**:
   - Paste token in `console.log(decodedToken)` to see decoded value
   - Check if `teacherId` or `userId` exists

3. **Check Network**:
   - Open DevTools → Network tab
   - Create exam and watch the request
   - Check response for error details

4. **Database**:
   - Is MongoDB running?
   - Is the database connection successful?
