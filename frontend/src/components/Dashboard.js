import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [interviewStatus, setInterviewStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, status] = await Promise.all([
        studentAPI.getStudentData(),
        studentAPI.getInterviewStatus()
      ]);
      setStudentData(data);
      setInterviewStatus(status);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'completed': 'success',
      'approved': 'success',
      'pending': 'warning',
      'scheduled': 'info',
      'rejected': 'danger'
    };
    const color = statusColors[status?.toLowerCase()] || 'default';
    return <span className={`status-badge status-${color}`}>{status || 'Pending'}</span>;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your data...</div>
      </div>
    );
  }

  if (error && !studentData) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {studentData?.fullName || 'Student'}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      {interviewStatus?.progress && (
        <div className="progress-section">
          <h2>Application Progress</h2>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${interviewStatus.progress.overall.percentage}%` }}>
              {interviewStatus.progress.overall.percentage}%
            </div>
          </div>
          <div className="progress-steps">
            <div className="progress-step">
              <span className="step-label">Application</span>
              {getStatusBadge(interviewStatus.progress.application)}
            </div>
            <div className="progress-step">
              <span className="step-label">Payment</span>
              {getStatusBadge(interviewStatus.progress.payment)}
            </div>
            <div className="progress-step">
              <span className="step-label">Assessment</span>
              {getStatusBadge(interviewStatus.progress.assessment)}
            </div>
            <div className="progress-step">
              <span className="step-label">Interview</span>
              {getStatusBadge(interviewStatus.progress.interview)}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Application ID:</span>
              <span className="info-value">{studentData?.applicationId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Registration Number:</span>
              <span className="info-value">{studentData?.registrationNumber || 'Not assigned'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Full Name:</span>
              <span className="info-value">{studentData?.fullName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{studentData?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone:</span>
              <span className="info-value">{studentData?.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date of Birth:</span>
              <span className="info-value">{formatDate(studentData?.dateOfBirth)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender:</span>
              <span className="info-value">{studentData?.gender}</span>
            </div>
            <div className="info-item">
              <span className="info-label">State of Origin:</span>
              <span className="info-value">{studentData?.stateOfOrigin}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Residence:</span>
              <span className="info-value">{studentData?.currentResidence}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Educational Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Education Level:</span>
              <span className="info-value">{studentData?.education}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Institution:</span>
              <span className="info-value">{studentData?.institution}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Field of Study:</span>
              <span className="info-value">{studentData?.fieldOfStudy}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Graduation Year:</span>
              <span className="info-value">{studentData?.graduationYear}</span>
            </div>
            <div className="info-item">
              <span className="info-label">NYSC Status:</span>
              <span className="info-value">{studentData?.nyscStatus}</span>
            </div>
            {studentData?.nyscNumber && (
              <div className="info-item">
                <span className="info-label">NYSC Number:</span>
                <span className="info-value">{studentData.nyscNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Interview Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Interview Date:</span>
              <span className="info-value">{formatDate(interviewStatus?.interviewDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Interview Status:</span>
              {getStatusBadge(interviewStatus?.interviewCompleted ? 'Completed' : interviewStatus?.interviewDate ? 'Scheduled' : 'Pending')}
            </div>
            {interviewStatus?.interviewScore !== null && (
              <div className="info-item">
                <span className="info-label">Interview Score:</span>
                <span className="info-value">{interviewStatus.interviewScore}%</span>
              </div>
            )}
            {interviewStatus?.chosenTrack && (
              <div className="info-item">
                <span className="info-label">Selected Track:</span>
                <span className="info-value">{interviewStatus.chosenTrack}</span>
              </div>
            )}
            {interviewStatus?.top3Tracks && interviewStatus.top3Tracks.length > 0 && (
              <div className="info-item">
                <span className="info-label">Top 3 Tracks:</span>
                <span className="info-value">{interviewStatus.top3Tracks.join(', ')}</span>
              </div>
            )}
            {interviewStatus?.interviewNotes && (
              <div className="info-item full-width">
                <span className="info-label">Interview Notes:</span>
                <span className="info-value">{interviewStatus.interviewNotes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Assessment & Payment</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Assessment Status:</span>
              {getStatusBadge(interviewStatus?.assessmentStatus)}
            </div>
            {interviewStatus?.assessmentScore !== null && (
              <div className="info-item">
                <span className="info-label">Assessment Score:</span>
                <span className="info-value">{interviewStatus.assessmentScore}%</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Payment Status:</span>
              {getStatusBadge(interviewStatus?.paymentCompleted && interviewStatus?.paymentVerified ? 'Completed' : 'Pending')}
            </div>
            {interviewStatus?.paymentDate && (
              <div className="info-item">
                <span className="info-label">Payment Date:</span>
                <span className="info-value">{formatDate(interviewStatus.paymentDate)}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Application Status:</span>
              {getStatusBadge(interviewStatus?.status)}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchData}>Refresh Data</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

