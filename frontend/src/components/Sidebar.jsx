import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/Sidebar.css'
import dashboardGif from '../assets/Dashboard.gif'
import estadisticasGif from '../assets/Estadisticas.gif'
import movimientosGif from '../assets/Movimientos.gif'
import categoriaGif from '../assets/Categoria.gif'
import adminGif from '../assets/Administracion.gif'

const Sidebar = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    setShowConfirm(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/')
  }

  const cancelLogout = () => setShowConfirm(false)

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardGif },
    { id: 'statistics', label: 'Estadísticas', icon: estadisticasGif },
    { id: 'movements', label: 'Movimientos', icon: movimientosGif },
    { id: 'categories', label: 'Categorías', icon: categoriaGif },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Administración', icon: adminGif }] : []),
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          {isOpen ? '◀' : '▶'}
        </button>
        {isOpen && <h2>Control</h2>}
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
            title={!isOpen ? section.label : ''}
          >
            <img src={section.icon} alt={section.label} className="nav-icon" />
            {isOpen && <span className="nav-label">{section.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isOpen && (
          <div className="user-info">
            <p className="user-name">{user?.first_name || user?.username}</p>
            <p className="user-email">{user?.email}</p>
            {user?.is_admin && <p className="user-role">👑 Admin</p>}
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
          {isOpen ? '🚪 Salir' : '🚪'}
        </button>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">¿Cerrar sesión?</div>
            <p className="modal-body">Confirma que deseas salir de tu cuenta.</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={cancelLogout}>Cancelar</button>
              <button className="modal-btn confirm" onClick={confirmLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
