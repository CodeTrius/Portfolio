import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Loading from './components/common/Loading';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Main Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContentListPage from './pages/ContentListPage';
import ContentPostPage from './pages/ContentPostPage';
import ContactPage from './pages/ContactPage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth Pages
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';

// User Page
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';

function App() {
  const { loadingAuth } = useAuth();

  if (loadingAuth) {
    return <Loading />;
  }

  return (
    <Routes>
       <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/:projectId" element={<ProjectDetailPage />} />
        <Route path="content" element={<ContentListPage />} />
        <Route path="content/post/:postId" element={<ContentPostPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Auth routes also use the main layout */}
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="registration-success" element={<RegistrationSuccessPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="stats" element={<AdminStatsPage />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;