# Quick Start Guide - Student Portal

## ✅ What's Been Created

Your student portal application is ready! Here's what has been set up:

### Backend (Node.js/Express)
- ✅ API server with Express
- ✅ PostgreSQL database connection
- ✅ Student login endpoint
- ✅ Student data retrieval endpoints
- ✅ Interview status tracking
- ✅ JWT authentication

### Frontend (React)
- ✅ Login page with Application ID
- ✅ Student dashboard
- ✅ Interview progress tracking
- ✅ Responsive design

## 🚀 How to Run

### Step 1: Start the Backend

```bash
cd /root/interviewapp/backend
npm start
```

The backend will run on **http://localhost:5000**

**Note**: If you're running this inside Docker or need to connect to the Docker database, you may need to:
- Change `DB_HOST` from `localhost` to `sbts_postgres` (the container name)
- Or use the host machine's IP if accessing from outside Docker

### Step 2: Start the Frontend

Open a new terminal:

```bash
cd /root/interviewapp/frontend
npm start
```

The frontend will run on **http://localhost:3000**

## 🔧 Database Connection

The application is configured to connect to:
- **Host**: localhost (or `sbts_postgres` if in Docker network)
- **Port**: 5432
- **Database**: sbts_db
- **User**: sbts_user
- **Password**: LbePDtWSSkXOc5yN0ZlDw00zf

If you need to change these, create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sbts_db
DB_USER=sbts_user
DB_PASSWORD=LbePDtWSSkXOc5yN0ZlDw00zf
PORT=5000
JWT_SECRET=your-secret-key-here
```

## 📝 Usage

1. Open your browser to **http://localhost:3000**
2. Enter a student's **Application ID** (password is optional)
3. Click "Login"
4. View the dashboard with:
   - Personal information
   - Educational background
   - Interview status and progress
   - Assessment scores
   - Payment status

## 🔍 Testing the API

You can test the backend API directly:

```bash
# Health check
curl http://localhost:5000/health

# Login (replace APPLICATION_ID with actual ID)
curl -X POST http://localhost:5000/api/students/login \
  -H "Content-Type: application/json" \
  -d '{"applicationId": "APPLICATION_ID"}'
```

## ⚠️ Important Notes

1. **Database Access**: Make sure the PostgreSQL container (`sbts_postgres`) is running
2. **Port Conflicts**: If port 5000 or 3000 are already in use, you'll need to change them
3. **CORS**: The backend has CORS enabled for development
4. **Authentication**: Tokens are stored in browser localStorage

## 🐛 Troubleshooting

### Backend won't connect to database
- Check if PostgreSQL container is running: `docker ps | grep postgres`
- Verify database credentials
- If running in Docker, use container name as host: `DB_HOST=sbts_postgres`

### Frontend can't reach backend
- Check backend is running on port 5000
- Verify CORS is enabled in backend
- Check browser console for errors

### Login fails
- Verify Application ID exists in database
- Check backend logs for errors
- Ensure database connection is working

## 📁 Project Structure

```
interviewapp/
├── backend/
│   ├── config/
│   │   └── database.js      # Database connection
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── routes/
│   │   └── students.js      # Student API routes
│   └── server.js            # Main server file
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Login.js      # Login component
│       │   └── Dashboard.js # Dashboard component
│       └── services/
│           └── api.js       # API service layer
└── README.md
```

## 🎯 Next Steps

1. Test with a real Application ID from your database
2. Customize the UI if needed
3. Add more features as required
4. Deploy to production when ready

