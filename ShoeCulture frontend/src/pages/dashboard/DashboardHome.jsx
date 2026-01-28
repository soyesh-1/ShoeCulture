import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../../utils/api.js'
import useSession from './useSession.js'
import '../../styles/DashboardPages.css'

function DashboardHome() {
  const { profile, loading } = useSession()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await request('/products')
        setProducts(data)
      } finally {
        setProductsLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Account overview</h2>
        {loading ? <p>Loading...</p> : null}
        {profile ? (
          <div className="info-grid">
            <div>
              <span className="label">Email</span>
              <span>{profile.email}</span>
            </div>
            <div>
              <span className="label">Role</span>
              <span>{profile.role}</span>
            </div>
            <div>
              <span className="label">Joined</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <p>Please sign in to view your dashboard.</p>
        )}
      </div>
      {profile ? (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Products</h2>
            {profile.role === 'admin' ? (
              <Link className="ghost" to="/dashboard/products">
                Manage products
              </Link>
            ) : null}
          </div>
          {productsLoading ? <p>Loading products...</p> : null}
          {!productsLoading && products.length === 0 ? (
            <p>No products yet.</p>
          ) : null}
          <div className="dashboard-products">
            {products
              .filter((product) => product.imageUrl)
              .slice(0, 8)
              .map((product) => (
                <div key={product._id} className="dashboard-product-card">
                  <div className="dashboard-product-image">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>
                  <div>
                    <h3>{product.name}</h3>
                    <span>Rs {product.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DashboardHome
