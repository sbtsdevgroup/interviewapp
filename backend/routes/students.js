const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

// Student login with applicationId
router.post('/login', async (req, res) => {
  try {
    const { applicationId, password } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    // Find student by applicationId
    const result = await pool.query(
      'SELECT * FROM students WHERE "applicationId" = $1',
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found with this Application ID' });
    }

    const student = result.rows[0];

    // Verify password if provided (some students might not have passwords set)
    if (password && student.password) {
      const isValidPassword = await bcrypt.compare(password, student.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: student.id, 
        applicationId: student.applicationId,
        email: student.email 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );

    // Return token and basic student info (without sensitive data)
    res.json({
      token,
      student: {
        id: student.id,
        applicationId: student.applicationId,
        email: student.email,
        fullName: student.fullName,
        registrationNumber: student.registrationNumber
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current student data (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = result.rows[0];

    // Remove sensitive data before sending
    const { password, resetToken, resetTokenExpiry, ...studentData } = student;

    res.json(studentData);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get interview status and progress
router.get('/interview-status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        "applicationId",
        "fullName",
        "email",
        "status",
        "assessmentStatus",
        "assessmentScore",
        "interviewDate",
        "interviewScore",
        "interviewCompleted",
        "interviewNotes",
        "paymentCompleted",
        "paymentVerified",
        "selectedProgram",
        "chosenTrack",
        "top3Tracks",
        "createdAt",
        "updatedAt"
      FROM students 
      WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = result.rows[0];

    // Calculate progress
    const progress = {
      application: student.status || 'pending',
      payment: student.paymentCompleted && student.paymentVerified ? 'completed' : 'pending',
      assessment: student.assessmentStatus || 'pending',
      interview: student.interviewCompleted ? 'completed' : (student.interviewDate ? 'scheduled' : 'pending'),
      overall: calculateOverallProgress(student)
    };

    res.json({
      ...student,
      progress
    });
  } catch (error) {
    console.error('Get interview status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate overall progress
function calculateOverallProgress(student) {
  let completed = 0;
  let total = 4;

  if (student.status && student.status !== 'pending') completed++;
  if (student.paymentCompleted && student.paymentVerified) completed++;
  if (student.assessmentStatus && student.assessmentStatus !== 'pending') completed++;
  if (student.interviewCompleted) completed++;

  return {
    percentage: Math.round((completed / total) * 100),
    completed,
    total
  };
}

module.exports = router;

