import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { Layout } from '@/components/Layout/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/contexts/AuthContext'

// Lazy load all page components for better performance
const HomePage = React.lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })))
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage').then(module => ({ default: module.LoginPage })))
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })))
const AuthCallbackPage = React.lazy(() => import('@/pages/auth/AuthCallbackPage').then(module => ({ default: module.AuthCallbackPage })))
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const KnowledgeBasePage = React.lazy(() => import('@/pages/KnowledgeBasePage').then(module => ({ default: module.KnowledgeBasePage })))
const FundingWizardPage = React.lazy(() => import('@/pages/FundingWizardPage').then(module => ({ default: module.FundingWizardPage })))
const PartnersPage = React.lazy(() => import('@/pages/PartnersPage').then(module => ({ default: module.PartnersPage })))
const LegislationTrackerPage = React.lazy(() => import('@/pages/LegislationTrackerPage').then(module => ({ default: module.LegislationTrackerPage })))
const StoryVaultPage = React.lazy(() => import('@/pages/StoryVaultPage').then(module => ({ default: module.StoryVaultPage })))
const PolicySimulatorPage = React.lazy(() => import('@/pages/PolicySimulatorPage').then(module => ({ default: module.PolicySimulatorPage })))
const CommunityBridgePage = React.lazy(() => import('@/pages/CommunityBridgePage').then(module => ({ default: module.CommunityBridgePage })))
const ProfileSettingsPage = React.lazy(() => import('@/pages/ProfileSettingsPage').then(module => ({ default: module.ProfileSettingsPage })))

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// Public Route component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// Placeholder components for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">This page is coming soon!</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><Suspense fallback={<LoadingSpinner />}><HomePage /></Suspense></Layout>} />
      <Route path="/knowledge" element={<Layout><Suspense fallback={<LoadingSpinner />}><KnowledgeBasePage /></Suspense></Layout>} />
      <Route path="/funding" element={<Layout><Suspense fallback={<LoadingSpinner />}><FundingWizardPage /></Suspense></Layout>} />
      <Route path="/partners" element={<Layout><Suspense fallback={<LoadingSpinner />}><PartnersPage /></Suspense></Layout>} />
      
      {/* Core platform modules */}
      <Route path="/legislation" element={<Layout><Suspense fallback={<LoadingSpinner />}><LegislationTrackerPage /></Suspense></Layout>} />
      <Route path="/stories" element={<Layout><Suspense fallback={<LoadingSpinner />}><StoryVaultPage /></Suspense></Layout>} />
      <Route path="/simulator" element={<Layout><Suspense fallback={<LoadingSpinner />}><PolicySimulatorPage /></Suspense></Layout>} />
      <Route path="/community" element={<Layout><Suspense fallback={<LoadingSpinner />}><CommunityBridgePage /></Suspense></Layout>} />
      
      {/* Auth routes */}
      <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<Suspense fallback={<LoadingSpinner />}><AuthCallbackPage /></Suspense>} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfileSettingsPage /></Layout></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Layout><PlaceholderPage title="Application Tracker" /></Layout></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Layout><PlaceholderPage title="Alerts & Notifications" /></Layout></ProtectedRoute>} />
      
      {/* Static pages */}
      <Route path="/about" element={<Layout><PlaceholderPage title="About Us" /></Layout>} />
      <Route path="/contact" element={<Layout><PlaceholderPage title="Contact Us" /></Layout>} />
      <Route path="/help" element={<Layout><PlaceholderPage title="Help Center" /></Layout>} />
      <Route path="/privacy" element={<Layout><PlaceholderPage title="Privacy Policy" /></Layout>} />
      <Route path="/terms" element={<Layout><PlaceholderPage title="Terms of Service" /></Layout>} />
      
      {/* Catch all route */}
      <Route path="*" element={<Layout><PlaceholderPage title="Page Not Found" /></Layout>} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App