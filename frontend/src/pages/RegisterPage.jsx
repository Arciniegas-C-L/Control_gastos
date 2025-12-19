import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form)
      navigate('/app')
    } catch (err) {
      setError('No se pudo registrar. Revisa los datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Control de gastos</p>
        <h1>Crea tu cuenta</h1>
        {error && <div className="alert">{error}</div>}
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>
            Correo
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </label>
          <div className="form-grid">
            <label>
              Nombre
              <input name="first_name" value={form.first_name} onChange={handleChange} />
            </label>
            <label>
              Apellido
              <input name="last_name" value={form.last_name} onChange={handleChange} />
            </label>
          </div>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Registrarme'}
          </button>
        </form>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
