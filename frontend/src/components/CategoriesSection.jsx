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
    <form className="panel category-form" onSubmit={handleSubmit}>
      <div className="panel-header">Nueva categoría</div>
      <div className="category-fields">
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="category-color">
          Color
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      </div>
      <div className="category-actions">
        <button className="secondary" type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}

const CategoriesSection = ({ onSubmit, loading }) => {
  return (
    <div className="section">
      <h2>Categorías</h2>
      <div className="categories-layout">
        <CategoryForm onSubmit={onSubmit} loading={loading} />
      </div>
    </div>
  )
}

export default CategoriesSection
