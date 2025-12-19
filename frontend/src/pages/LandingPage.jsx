import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime
    let animationFrame

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentValue = Math.floor(value * progress)

      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return `$${displayValue.toLocaleString()}`
}

const LandingPage = () => {
  const navigate = useNavigate()
  const { token } = useAuth()

  const goDashboard = () => {
    if (token) navigate('/app')
    else navigate('/login')
  }

  const features = [
    {
      icon: '📊',
      title: 'Gráficas inteligentes',
      desc: 'Visualiza ingresos vs gastos y desglose por categoría con gráficas interactivas.',
    },
    {
      icon: '🏷️',
      title: 'Categorías personalizadas',
      desc: 'Crea tus propias categorías, asigna colores y organiza tus movimientos.',
    },
    {
      icon: '💰',
      title: 'Presupuestos y alertas',
      desc: 'Establece límites mensuales y recibe alertas cuando los excedas.',
    },
    {
      icon: '📈',
      title: 'Reportes mensuales',
      desc: 'Exporta reportes en PDF o Excel para un análisis más profundo.',
    },
    {
      icon: '🔐',
      title: 'Seguro y privado',
      desc: 'Tus datos son solo tuyos. Cifrados y almacenados de forma segura.',
    },
    {
      icon: '📱',
      title: 'Acceso en cualquier lugar',
      desc: 'Usa desde tu navegador, tablet o móvil. Siempre sincronizado.',
    },
  ]

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="logo-mark">💼 ControlGastos</div>
        <div className="nav-actions">
          <Link to="/login" className="ghost small">Iniciar sesión</Link>
          <Link to="/register" className="primary small">Crear cuenta</Link>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow">Tu control financiero</p>
            <h1>Administra tus finanzas de forma inteligente</h1>
            <p className="subhead">
              Registra cada movimiento, visualiza tendencias y toma decisiones basadas en datos reales.
              Sin complicaciones, sin límites.
            </p>
            <div className="cta-row">
              <button className="primary-btn" onClick={goDashboard}>Comienza gratis</button>
              <Link to="/register" className="secondary-link">Ver características</Link>
            </div>
            <div className="trust-badges">
              <span>✅ Sin tarjeta de crédito</span>
              <span>✅ Acceso inmediato</span>
              <span>✅ 100% privado</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">Resumen de hoy</div>
              <div className="mini-cards">
                <div className="mini-card income">
                  <span>Ingresos</span>
                  <strong><AnimatedNumber value={12400} /></strong>
                </div>
                <div className="mini-card expense">
                  <span>Gastos</span>
                  <strong><AnimatedNumber value={8150} /></strong>
                </div>
                <div className="mini-card balance">
                  <span>Balance</span>
                  <strong><AnimatedNumber value={4250} /></strong>
                </div>
              </div>
              <div className="mini-legend">
                <div className="legend-item income-item">
                  <div className="dot" /> Ingresos
                </div>
                <div className="legend-item expense-item">
                  <div className="dot" /> Gastos
                </div>
              </div>
              <div className="mini-list">
                <div className="row">
                  <span>Alimentación</span>
                  <span className="amount"><AnimatedNumber value={420} /></span>
                </div>
                <div className="row">
                  <span>Transporte</span>
                  <span className="amount"><AnimatedNumber value={260} /></span>
                </div>
                <div className="row">
                  <span>Vivienda</span>
                  <span className="amount"><AnimatedNumber value={1250} /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="section-header">
            <p className="eyebrow">Características principales</p>
            <h2>Todo lo que necesitas para controlar tu dinero</h2>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <h2>¿Listo para tomar control?</h2>
          <p>Únete a miles de usuarios que ya controlan su dinero</p>
          <button className="primary-btn large" onClick={goDashboard}>Crear cuenta gratis</button>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
