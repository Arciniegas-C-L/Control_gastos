import cerditoGif from '../assets/Cerdito_,money.gif'

const SummaryCard = ({ label, value }) => (
  <div className="card">
    <p className="card-label">{label}</p>
    <p className="card-value">${Number(value || 0).toLocaleString()}</p>
  </div>
)

const DashboardSection = ({ summary }) => {
  return (
    <div className="section">
      <div className="dashboard-title">
        <h2>Dashboard Principal</h2>
        <img src={cerditoGif} alt="Cerdito ahorro" className="dashboard-gif" />
      </div>
      <div className="summary-grid">
        <SummaryCard label="Ingresos" value={summary.income} />
        <SummaryCard label="Gastos" value={summary.expense} />
        <SummaryCard label="Balance" value={summary.balance} />
      </div>
    </div>
  )
}

export default DashboardSection
