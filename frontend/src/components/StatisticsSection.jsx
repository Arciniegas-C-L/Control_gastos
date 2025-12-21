import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo } from 'react'

const StatisticsSection = ({ summary }) => {
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
    <div className="section">
      <h2>Estadísticas</h2>
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
      <div className="panel">
        <div className="panel-header">Tendencia mensual</div>
        <div className="chart-area">
          {monthlyData.length === 0 ? (
            <p className="muted">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Ingresos" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Gastos" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatisticsSection
