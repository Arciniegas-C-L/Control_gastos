import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  createCategory,
  createMovement,
  fetchCategories,
  fetchMovements,
  fetchSummary,
} from '../services/api'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const today = () => new Date().toISOString().slice(0, 10)

const SummaryCard = ({ label, value }) => (
  <div className="card">
    <p className="card-label">{label}</p>
    <p className="card-value">${Number(value || 0).toLocaleString()}</p>
  </div>
)

const MovementForm = ({ categories, onSubmit, loading }) => {
  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: today(),
    description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) return
    await onSubmit({
      ...form,
      amount: Number(form.amount || 0),
    })
    setForm((prev) => ({ ...prev, amount: '', description: '' }))
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">Nuevo movimiento</div>
      <div className="form-grid">
        <label>
          Monto
          <input
            name="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Tipo
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto</option>
          </select>
        </label>
        <label>
          Categoría
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha
          <input name="date" type="date" value={form.date} onChange={handleChange} />
        </label>
      </div>
      <label>
        Descripción
        <textarea
          name="description"
          rows="2"
          value={form.description}
          onChange={handleChange}
          placeholder="Opcional"
        />
      </label>
      <button className="primary" type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar movimiento'}
      </button>
    </form>
  )
}

const CategoryForm = ({ onSubmit, loading }) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#4f46e5')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name) return
    await onSubmit({ name, color })
    setName('')
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">Nueva categoría</div>
      <div className="form-grid">
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Color
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      </div>
      <button className="secondary" type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear categoría'}
      </button>
    </form>
  )
}

const MovementsList = ({ movements }) => (
  <div className="panel">
    <div className="panel-header">Movimientos recientes</div>
    <div className="table">
      <div className="table-head">
        <span>Fecha</span>
        <span>Tipo</span>
        <span>Categoría</span>
        <span>Descripción</span>
        <span className="right">Monto</span>
      </div>
      {movements.length === 0 && <div className="table-row">Sin datos</div>}
      {movements.map((m) => (
        <div className="table-row" key={m.id}>
          <span>{m.date}</span>
          <span className={m.type === 'INCOME' ? 'pill green' : 'pill red'}>
            {m.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
          </span>
          <span className="pill" style={{ background: m.category_color || '#e5e7eb' }}>
            {m.category_name}
          </span>
          <span>{m.description || '-'}</span>
          <span className="right">${Number(m.amount).toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
)

const Charts = ({ summary }) => {
  const pieData = summary.category_breakdown?.map((c) => ({
    name: c.category__name,
    value: Number(c.total),
    fill: c.category__color || '#818cf8',
  })) || []

  const monthlyData = useMemo(() => {
    const grouped = {}
    summary.monthly?.forEach((item) => {
      const month = item.month?.slice(0, 7) || 'N/A'
      if (!grouped[month]) grouped[month] = { month, income: 0, expense: 0 }
      if (item.type === 'INCOME') grouped[month].income = Number(item.total)
      if (item.type === 'EXPENSE') grouped[month].expense = Number(item.total)
    })
    return Object.values(grouped).sort((a, b) => (a.month > b.month ? 1 : -1))
  }, [summary])

  return (
    <div className="charts-grid">
      <div className="panel">
        <div className="panel-header">Gastos por categoría</div>
        <div className="chart-area">
          {pieData.length === 0 ? (
            <p className="muted">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" fill="#8884d8" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="panel">
        <div className="panel-header">Ingresos vs Gastos por mes</div>
        <div className="chart-area">
          {monthlyData.length === 0 ? (
            <p className="muted">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Ingresos" />
                <Bar dataKey="expense" fill="#ef4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState({})
  const [movements, setMovements] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="page dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">Control de gastos</p>
          <h1>Hola, {user?.first_name || user?.username}</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="summary-grid">
        <SummaryCard label="Ingresos" value={summary.income} />
        <SummaryCard label="Gastos" value={summary.expense} />
        <SummaryCard label="Balance" value={summary.balance} />
      </div>

      <Charts summary={summary} />

      <div className="grid-2">
        <MovementForm categories={categories} onSubmit={handleMovement} loading={loading} />
        <CategoryForm onSubmit={handleCategory} loading={loading} />
      </div>

      <MovementsList movements={movements} />
    </div>
  )
}

export default DashboardPage
