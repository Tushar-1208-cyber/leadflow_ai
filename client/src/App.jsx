import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layout & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadPipeline from './pages/LeadPipeline';
import LeadsTable from './pages/LeadsTable';
import TasksCalendar from './pages/TasksCalendar';
import TeamHub from './pages/TeamHub';
import Settings from './pages/Settings';
import { Spinner } from './components/Loader';

// Guard: Redirect authenticated users away from login
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Guard: Team Hub roles restrict (Only Manager/Admin or Team Leader)
const ManagerRoute = ({ children }) => {
  const { user } = useAuth();
  if (user && (user.role === 'admin' || user.role === 'team-leader')) {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public auth pages */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Private BDA workspace pages */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pipeline" element={<LeadPipeline />} />
          <Route path="leads" element={<LeadsTable />} />
          <Route path="tasks" element={<TasksCalendar />} />
          
          <Route
            path="team"
            element={
              <ManagerRoute>
                <TeamHub />
              </ManagerRoute>
            }
          />
          
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
