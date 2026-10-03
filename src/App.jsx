import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// Layout components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import DarshanRituals from './pages/DarshanRituals';
import FestivalCalendar from './pages/FestivalCalendar';
import SevaPuja from './pages/SevaPuja';
import Donation from './pages/Donation';
import PrasadBhoga from './pages/PrasadBhoga';
import Gallery from './pages/Gallery';
import NewsNotices from './pages/NewsNotices';
import PlanYourVisit from './pages/PlanYourVisit';
import ContactGrievance from './pages/ContactGrievance';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-cream-light dark:bg-temple-darker text-temple-900 dark:text-cream-light transition-colors duration-300">
            {/* Navigation Header */}
            <Header />

            {/* Main Page Workspace */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/darshan" element={<DarshanRituals />} />
                <Route path="/festivals" element={<FestivalCalendar />} />
                <Route path="/seva" element={<SevaPuja />} />
                <Route path="/donation" element={<Donation />} />
                <Route path="/prasad" element={<PrasadBhoga />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/notices" element={<NewsNotices />} />
                <Route path="/visit" element={<PlanYourVisit />} />
                <Route path="/contact" element={<ContactGrievance />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Devotee Profile */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['devotee']}>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Admin Board */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'donation_manager', 'seva_manager', 'content_editor', 'notice_manager']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all fallback redirect */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
