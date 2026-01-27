import { useLocation } from 'react-router-dom'
import '../../styles/DashboardPages.css'

function DashboardOrders() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const success = params.get('success') === 'true'

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Orders</h2>
        {success ? (
          <p>Payment successful. Your order is being processed.</p>
        ) : (
          <p>Checkout will appear once payments are enabled.</p>
        )}
      </div>
    </div>
  )
}

export default DashboardOrders
