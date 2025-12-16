import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router";
import SigninPage from './pages/SigninPage';
import Dashboard from './pages/admin/Dashboard';
import { Toaster } from "react-hot-toast";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { authStore } from './store/authStore';
import { Loader } from 'lucide-react';
import AddTeacherPage from './pages/admin/AddTeacherPage';
import AddClassPage from "./pages/admin/AddClassPage.jsx";
import AddStudentPage from './pages/admin/AddStudentPage.jsx';
import AttendancePage from './pages/admin/AttendancePage.jsx';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage.jsx';
import StudentAttendancePage from './pages/student/StudentAttendancePage.jsx';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage.jsx';
import StudentsPage from './pages/teacher/StudentsPage.jsx';
import ClassesPage from './pages/teacher/ClassesPage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthorized, isCheckingAuth } = authStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#6c62ff]" /> 
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to="/signin" replace />;
};


const PublicRoute = ({ children }) => {
  const { isAuthorized, isCheckingAuth } = authStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#6c62ff]" /> 
      </div>
    );
  }

  return isAuthorized ? <Navigate to="/" replace /> : children;
};

function App() {
  const { checkAuth } = authStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const { isCheckingAuth, isAuthorized , user } = authStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-[#6c62ff]" /> 
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {isAuthorized ? (
        <div className="flex bg-gray-50 min-h-screen">
          <Sidebar isOpen={isOpen} />
          <div className="flex flex-col flex-1">
            <Navbar setIsOpen={setIsOpen} />
            <main className="flex-1 p-3">
              { user?.role.toLowerCase() === 'admin' &&  <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/teachers" element={<ProtectedRoute><AddTeacherPage /></ProtectedRoute>} />
                  <Route path="/classes" element={<ProtectedRoute><AddClassPage /></ProtectedRoute>} />
                  <Route path="/students" element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
                  <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
              </Routes> }
              { user?.role.toLowerCase() === 'teacher' &&  <Routes>
                <Route path="/teacher" element={<ProtectedRoute><TeacherDashboardPage /></ProtectedRoute>} />
                <Route path="/teacher/attendance" element={<ProtectedRoute><TeacherAttendancePage /></ProtectedRoute>} />
                <Route path="/teacher/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
                <Route path="/teacher/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/teacher" replace />} />
              </Routes> }
              { user?.role.toLowerCase() === 'student' &&  <Routes>
                <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/attendance" element={<ProtectedRoute><StudentAttendancePage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/student" replace />} />
              </Routes> }
            </main>
          </div>
        </div>
      ) : (
        
        <Routes>
          <Route path="/signin" element={<PublicRoute><SigninPage /></PublicRoute>} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;