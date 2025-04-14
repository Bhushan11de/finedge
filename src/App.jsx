import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Signin from './pages/Signin'; // Updated from Login
import Signup from './pages/Signup'; // Updated from Register

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
};

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const handleThemeChange = (e) => {
      const newTheme = e.detail.theme || e.detail || localStorage.getItem('theme') || 'light';
      console.log('App: Theme change detected:', newTheme);
      setTheme(newTheme);
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    };

    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', () => {
      const storedTheme = localStorage.getItem('theme') || 'light';
      handleThemeChange({ detail: { theme: storedTheme } });
    });
    document.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
      document.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <AuthProvider>
      <Router>
        <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#171717]' : 'bg-white'}`}>
          <Sidebar theme={theme} />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/signin" element={<Signin theme={theme} />} /> {/* Updated path */}
              <Route path="/signup" element={<Signup theme={theme} />} /> {/* Updated path */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard theme={theme} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio theme={theme} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <Watchlist theme={theme} />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/signin" replace />} /> {/* Default to Signin */}
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
