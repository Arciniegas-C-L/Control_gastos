import { useState } from 'react'

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

const CategoriesSection = ({ onSubmit, loading }) => {
  return (
    <div className="section">
      <h2>Categorías</h2>
      <div className="grid-2">
        <CategoryForm onSubmit={onSubmit} loading={loading} />
      </div>
    </div>
  )
}

export default CategoriesSection
