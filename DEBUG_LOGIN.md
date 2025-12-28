# 🔍 Login Debugging Guide

## Issue
Login page stays on login page after clicking login button - no errors shown.

## Debugging Steps Added

I've added console logging to help identify the issue. Please follow these steps:

### 1. Open Browser DevTools
- Press `F12` or right-click → Inspect
- Go to the **Console** tab
- Keep it open while testing

### 2. Try to Login
- Enter Application ID: `APP-2025-67987`
- Click "Login"
- Watch the console for messages

### 3. What to Look For

You should see console logs like:
```
Attempting login with Application ID: APP-2025-67987
API call - Login: { applicationId: "APP-2025-67987", baseURL: "..." }
Creating API instance with baseURL: http://localhost:3013/api
API response: { token: "...", student: {...} }
Login successful: { token: "...", student: {...} }
```

### 4. Common Issues to Check

**If you see "ERR_CONNECTION_REFUSED":**
- Backend might not be running
- Check: `docker ps | grep interviewapp_backend`

**If you see "404 Not Found":**
- API route might be wrong
- Check: `curl http://localhost:3013/api/health`

**If you see "401 Unauthorized":**
- Application ID might not exist
- Check database for the Application ID

**If you see no errors but no redirect:**
- Check if `window.location.href = '/dashboard'` is being called
- Check browser Network tab to see if the request is made

### 5. Check Network Tab
- In DevTools, go to **Network** tab
- Try logging in again
- Look for the request to `/api/students/login`
- Check:
  - Status code (should be 200 or 201)
  - Response body (should contain token)
  - Request URL (should be correct)

### 6. Check Application Tab
- In DevTools, go to **Application** tab
- Check **Local Storage**
- After login attempt, you should see:
  - `auth-storage` key with token and student data
  - `token` key (if set separately)

## Quick Test

Run this in browser console after page loads:
```javascript
// Check API URL
console.log('API URL:', window.location.protocol + '//' + window.location.hostname + ':3013/api');

// Test API directly
fetch('http://localhost:3013/api/students/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ applicationId: 'APP-2025-67987' })
})
.then(r => r.json())
.then(data => console.log('Direct API test:', data))
.catch(err => console.error('Direct API error:', err));
```

## Next Steps

After checking the console:
1. Share the console output
2. Share any errors from Network tab
3. Check if localStorage has the token after login attempt

---

**Please check the browser console and share what you see!**

