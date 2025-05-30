import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthForm from './components/AuthForm'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Benchmarks from './pages/Benchmarks'
import Strength from './pages/Strength'
import Cardio from './pages/Cardio'
import BodyMetrics from './pages/BodyMetrics'
import Statistics from './pages/Statistics'

const AppContent = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'benchmarks':
        return <Benchmarks />
      case 'strength':
        return <Strength />
      case 'cardio':
        return <Cardio />
      case 'body':
        return <BodyMetrics />
      case 'stats':
        return <Statistics />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderPage()}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App