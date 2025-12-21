import { useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

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

const MovementsSection = ({ movements, categories, onSubmit, loading }) => {
  return (
    <div className="section">
      <h2>Movimientos</h2>
      <div className="grid-2">
        <MovementForm categories={categories} onSubmit={onSubmit} loading={loading} />
      </div>
      <MovementsList movements={movements} />
    </div>
  )
}

export default MovementsSection
