import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SetupProfilePage from './pages/SetupProfilePage';
import FindPartnersPage from './pages/FindPartnersPage';
import RequestsPage from './pages/RequestsPage';
import HistoryPage from './pages/HistoryPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailsPage from './pages/CommunityDetailsPage';
import MessagesListPage from './pages/MessagesListPage';
import ChatWindowPage from './pages/ChatWindowPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCommunitiesPage from './pages/admin/AdminCommunitiesPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import PublicProfilePage from './pages/PublicProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile/:id" element={<PublicProfilePage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup-profile"
            element={
              <ProtectedRoute>
                <SetupProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-partners"
            element={
              <ProtectedRoute>
                <FindPartnersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communities"
            element={
              <ProtectedRoute>
                <CommunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communities/:id"
            element={
              <ProtectedRoute>
                <CommunityDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute>
                <ChatWindowPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/communities"
            element={
              <ProtectedRoute requireAdmin>
                <AdminCommunitiesPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
