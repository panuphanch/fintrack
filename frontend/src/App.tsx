import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AcceptInvitePage = lazy(() => import('./pages/AcceptInvitePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CardsPage = lazy(() => import('./pages/CardsPage'));
const CardFormPage = lazy(() => import('./pages/CardFormPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const TransactionFormPage = lazy(() => import('./pages/TransactionFormPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const InstallmentsPage = lazy(() => import('./pages/InstallmentsPage'));
const FixedCostsPage = lazy(() => import('./pages/FixedCostsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="cards/new" element={<CardFormPage />} />
          <Route path="cards/:id/edit" element={<CardFormPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/new" element={<TransactionFormPage />} />
          <Route path="transactions/:id/edit" element={<TransactionFormPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="installments" element={<InstallmentsPage />} />
          <Route path="fixed-costs" element={<FixedCostsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
