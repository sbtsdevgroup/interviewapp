# Quick Setup Guide

## ✅ What Has Been Created

### Backend (Node.js/Express API)
- ✅ Server setup with Express
- ✅ PostgreSQL database connection
- ✅ Student login endpoint (using Application ID)
- ✅ Student data retrieval endpoints
- ✅ Interview status tracking
- ✅ JWT authentication

### Frontend (React)
- ✅ Login page with Application ID form
- ✅ Student dashboard showing all data
- ✅ Interview progress tracking
- ✅ Protected routes
- ✅ Modern, responsive UI

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install  # Already done
```

**Important**: Create a `.env` file in the `backend` directory with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sbts_db
DB_USER=sbts_user
DB_PASSWORD=LbePDtWSSkXOc5yN0ZlDw00zf
PORT=5000
JWT_SECRET=student-portal-secret-key-change-in-production-2024
```

**Note**: If the database is in a Docker container and you're running the backend outside Docker, you may need to:
- Use `localhost` if the container exposes port 5432
- Or use the container's IP address
- Or run the backend in the same Docker network

Start the backend:
```bash
npm start
# or for development:
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install  # Already done
```

**Optional**: Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

### 3. Access the Application

1. Open browser to `http://localhost:3000`
2. Enter a student's Application ID
3. Click Login
4. View the dashboard with all student information

## 📋 Database Connection

The application connects to the existing PostgreSQL database:
- **Container**: `sbts_postgres`
- **Database**: `sbts_db`
- **User**: `sbts_user`
- **Port**: 5432 (exposed on host)

## 🔧 Troubleshooting

### Backend can't connect to database
- Check if PostgreSQL container is running: `docker ps | grep postgres`
- Verify database credentials
- If running in Docker, ensure network connectivity

### Frontend can't reach backend
- Check backend is running on port 5000
- Verify CORS is enabled (already configured)
- Check browser console for errors

### Login fails
- Verify Application ID exists in database
- Check backend logs for errors
- Ensure database connection is working

## 📝 API Endpoints

- `POST /api/students/login` - Login with Application ID
- `GET /api/students/me` - Get student data (requires auth)
- `GET /api/students/interview-status` - Get interview progress (requires auth)

## 🎯 Features Implemented

✅ Login with Application ID (password optional)
✅ View all student personal information
✅ View educational background
✅ View interview details and status
✅ View assessment scores
✅ View payment status
✅ Application progress tracking
✅ Responsive design
✅ Protected routes
✅ JWT authentication

