# InterviewApp Backend API

## Overview

The InterviewApp Backend is a REST API that serves as the backbone for a student interview portal. It provides endpoints for student authentication, assessment management, interview scheduling, and real-time communication features. The system integrates AI services for interview analysis and supports WebRTC for video interviews.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Student Management**: Complete CRUD operations for student profiles and progress tracking
- **Interview Management**: Schedule, manage, and track interview sessions
- **AI Integration**: Automated interview analysis with scoring and feedback
- **Real-time Communication**: WebRTC support for video interviews and WebSocket notifications
- **Notification System**: In-app notifications for students and administrators
- **Assessment Tracking**: Quiz/assessment score management and status tracking
- **Database Integration**: PostgreSQL with connection pooling
- **Docker Support**: Containerized deployment with multi-stage builds

## Tech Stack

### Core Framework
- **NestJS**: Progressive Node.js framework for building efficient, scalable server-side applications
- **TypeScript**: Strongly typed programming language for better code quality

### Database & Storage
- **PostgreSQL**: Advanced open-source relational database
- **pg (node-postgres)**: PostgreSQL client for Node.js

## Installation

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- PostgreSQL database
- Docker (optional, for containerized deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sbts_db
   DB_USER=sbts_user
   DB_PASSWORD=your-database-password
   ```

4. **Database Setup**
   - Ensure PostgreSQL is running
   - Create the database: `createdb sbts_db`
   - Run the SQL scripts in order:
     ```bash
     psql -d sbts_db -f create_interviews_table.sql
     psql -d sbts_db -f create_notifications_table.sql
     psql -d sbts_db -f add_quiz_columns.sql
     psql -d sbts_db -f add_interview_ai_tables.sql
     ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:xxxx`

## Database Schema

### Core Tables

#### Students
- Stores student profile information, assessment scores, and interview details
- Includes quiz scores, payment status, and progress tracking

#### Interviews
- Admin-managed interview records with scheduling information
- Tracks interviewer details, tracks, and custom values

#### Notifications
- In-app notification system for both students and admins
- Supports different notification types and read status

#### Interview Recordings & AI Analysis
- Stores interview recordings and transcripts
- AI-powered analysis results with scoring and recommendations

## Development

### Project Structure

```
backend/
├── src/
│   ├── ai/                 # AI analysis module
│   ├── auth/               # Authentication module
│   ├── common/             # Shared utilities and guards
│   ├── database/           # Database configuration
│   ├── interviews/         # Interview management
│   ├── notifications/      # Notification system
│   ├── students/           # Student management
│   ├── webrtc/             # WebRTC signaling
│   ├── app.controller.ts   # Main application controller
│   ├── app.module.ts       # Root application module
│   └── main.ts             # Application bootstrap
├── config/                 # Configuration files
├── middleware/             # Express middleware
├── routes/                 # Legacy Express routes
├── *.sql                   # Database migration scripts
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── nest-cli.json           # NestJS CLI configuration
```
