import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  createCategory,
  createMovement,
  fetchCategories,
  fetchMovements,
  fetchSummary,
} from '../services/api'
import Sidebar from '../components/Sidebar'
import DashboardSection from '../components/DashboardSection'
import StatisticsSection from '../components/StatisticsSection'
import MovementsSection from '../components/MovementsSection'
import CategoriesSection from '../components/CategoriesSection'
import AdminSection from '../components/AdminSection'

const DashboardPage = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState({})
  const [movements, setMovements] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('dashboard')

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, m, c] = await Promise.all([
        fetchSummary(),
        fetchMovements({ limit: 10 }),
        fetchCategories(),
      ])
      setSummary(s)
      setMovements(m)
      setCategories(c)
    } catch (err) {
      setError('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleMovement = async (payload) => {
    setLoading(true)
    await createMovement(payload)
    await loadData()
    setLoading(false)
  }

  const handleCategory = async (payload) => {
    setLoading(true)
    await createCategory(payload)
    await loadData()
    setLoading(false)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection summary={summary} />
      case 'statistics':
        return <StatisticsSection summary={summary} />
      case 'movements':
        return <MovementsSection movements={movements} categories={categories} onSubmit={handleMovement} loading={loading} />
      case 'categories':
        return <CategoriesSection onSubmit={handleCategory} loading={loading} />
      case 'admin':
        return <AdminSection />
      default:
        return <DashboardSection summary={summary} />
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Control de gastos</p>
            <h1>Hola, {user?.first_name || user?.username}</h1>
          </div>
        </header>

        {error && <div className="alert">{error}</div>}

        <div className="dashboard-content">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
