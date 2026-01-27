import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../utils/api.js'
import { addToCart } from '../utils/cart.js'
import '../styles/Shop.css'

const formatPrice = (value) => `Rs ${value.toLocaleString()}`

function Shop() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await request('/products')
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    const loadSession = async () => {
      try {
        await request('/users/me')
        setIsAuthed(true)
      } catch (err) {
        setIsAuthed(localStorage.getItem('auth') === 'true')
      }
    }
    loadSession()
  }, [])

  const handleSeed = async () => {
    setSeeding(true)
    setError('')
    try {
      await request('/products/seed', { method: 'POST' })
      await loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="shop">
      <header className="shop-header">
        <h1>ShoeCulture Shop</h1>
        <p>Browse the latest shoes and add them to your cart.</p>
      </header>
      {!isAuthed ? (
        <div className="notice">
          Please <Link to="/login">sign in</Link> to add items to your cart.
        </div>
      ) : null}
      {error ? <div className="error">{error}</div> : null}
      {loading ? <p>Loading products...</p> : null}
      {!loading && products.length === 0 ? (
        <div className="empty">
          <p>No products yet.</p>
          <button className="solid" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Load sample products'}
          </button>
        </div>
      ) : null}
      <div className="shop-grid">
        {products.map((product) => (
          <article key={product._id} className="shop-card">
            {product.imageUrl ? (
              <img
                className="shop-image"
                src={product.imageUrl}
                alt={product.name}
              />
            ) : null}
            <div className="shop-card-body">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <span className="price">{formatPrice(product.price)}</span>
            </div>
            <div className="shop-card-actions">
              <Link className="ghost" to={`/products/${product._id}`}>
                View details
              </Link>
              <button
                className="solid"
                type="button"
                onClick={() => {
                  if (!isAuthed) {
                    setAuthMessage('Please sign in to add items to cart.')
                    return
                  }
                  addToCart(product._id)
                }}
              >
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
      {authMessage ? <div className="error">{authMessage}</div> : null}
    </div>
  )
}

export default Shop
