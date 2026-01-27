import { useEffect, useState } from 'react'
import { request } from '../../utils/api.js'
import '../../styles/DashboardPages.css'

const formatPrice = (value) => `Rs ${value.toLocaleString()}`

function DashboardProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await request('/products')
        setProducts(data)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Products</h2>
        {loading ? <p>Loading products...</p> : null}
        {!loading && products.length === 0 ? <p>No products yet.</p> : null}
        <div className="table">
          {products.map((product) => (
            <div key={product._id} className="table-row">
              <span>{product.name}</span>
              <span>{formatPrice(product.price)}</span>
              <span>Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardProducts
