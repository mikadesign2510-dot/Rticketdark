import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import CreateEventPage from './pages/CreateEventPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function AnimatedRouteContainer() {
  const location = useLocation();

  // پیمایش خودکار به بالای صفحه هنگام تعویض مسیر
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-fade-in w-full min-h-screen">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRouteContainer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
