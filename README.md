# Student Portal - Interview Application

A student portal application that allows students to login with their Application ID and view their application data, interview status, and progress.

## Features

- **Student Login**: Login using Application ID (password optional)
- **Dashboard**: View all student information including:
  - Personal information
  - Educational background
  - Interview details and status
  - Assessment scores
  - Payment status
  - Application progress tracking

## Project Structure

```
interviewapp/
├── backend/          # Node.js/Express API server
│   ├── config/       # Database configuration
│   ├── middleware/   # Authentication middleware
│   ├── routes/       # API routes
│   └── server.js     # Main server file
├── frontend/         # React frontend application
│   └── src/
│       ├── components/  # React components
│       └── services/     # API service layer
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (already running in Docker container)
- npm or yarn

## Database Configuration

The application connects to the existing PostgreSQL database:
- **Host**: localhost (or the Docker container name if running in Docker network)
- **Port**: 5432
- **Database**: sbts_db
- **User**: sbts_user
- **Password**: LbePDtWSSkXOc5yN0ZlDw00zf

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are set):
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### POST `/api/students/login`
Login with Application ID
- **Body**: `{ "applicationId": "string", "password": "string" }`
- **Response**: `{ "token": "jwt-token", "student": {...} }`

### GET `/api/students/me`
Get current student data (requires authentication)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Student data object

### GET `/api/students/interview-status`
Get interview status and progress (requires authentication)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Interview status with progress tracking

## Usage

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Enter your Application ID (and password if set)
4. View your dashboard with all application information and interview progress

## Notes

- The application uses JWT tokens for authentication
- Tokens are stored in localStorage
- If the database is running in a Docker container, you may need to adjust the DB_HOST in the backend configuration
- The password field is optional during login - students can login with just their Application ID if no password is set

