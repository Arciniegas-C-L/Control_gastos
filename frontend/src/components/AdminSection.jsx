import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

const fetchAdminData = async (token) => {
  const response = await fetch('http://localhost:8000/api/admin/dashboard/', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('No autorizado')
  return response.json()
}

const fetchAllUsers = async (token) => {
  const response = await fetch('http://localhost:8000/api/admin/users/', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Error al obtener usuarios')
  return response.json()
}

const AdminSection = () => {
  const { token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (!user?.is_admin) return
      setLoading(true)
      setError(null)
      try {
        const [dashData, usersData] = await Promise.all([
          fetchAdminData(token),
          fetchAllUsers(token),
        ])
        setStats(dashData)
        setUsers(usersData)
      } catch (err) {
        setError('Error cargando datos administrativos')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [token, user])

  if (!user?.is_admin) {
    return (
      <div className="section">
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </div>
    )
  }

  if (loading) return <div className="section"><p>Cargando...</p></div>
  if (error) return <div className="section alert">{error}</div>

  return (
    <div className="section">
      <h2>Panel Administrativo</h2>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Usuarios Totales</p>
            <p className="stat-value">{stats.total_users}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Administradores</p>
            <p className="stat-value">{stats.admin_users}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Usuarios Regulares</p>
            <p className="stat-value">{stats.regular_users}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Ingresos Totales</p>
            <p className="stat-value">${stats.total_income.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Gastos Totales</p>
            <p className="stat-value">${stats.total_expense.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Balance Total</p>
            <p className="stat-value">${stats.total_balance.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="admin-content">
        <div className="admin-section">
          <h3>Usuarios del Sistema</h3>
          <div className="admin-table">
            <div className="table-head">
              <span>Usuario</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Movimientos</span>
              <span className="right">Balance</span>
            </div>
            {users.map((u) => (
              <div
                key={u.id}
                className="table-row clickable"
                onClick={() => setSelectedUser(u)}
                style={{ cursor: 'pointer' }}
              >
                <span>{u.username}</span>
                <span>{u.email}</span>
                <span className="pill">{u.role}</span>
                <span>{u.total_movements}</span>
                <span className="right">
                  ${Number(u.balance).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <div className="admin-section">
            <h3>Detalles: {selectedUser.username}</h3>
            <div className="user-detail">
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Nombre:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
              <p><strong>Rol:</strong> {selectedUser.role}</p>
              <p><strong>Registrado:</strong> {new Date(selectedUser.registered_at).toLocaleDateString()}</p>
              <p><strong>Total Movimientos:</strong> {selectedUser.total_movements}</p>
              <p><strong>Ingresos:</strong> ${Number(selectedUser.total_income).toLocaleString()}</p>
              <p><strong>Gastos:</strong> ${Number(selectedUser.total_expense).toLocaleString()}</p>
              <p><strong>Balance:</strong> ${Number(selectedUser.balance).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSection
