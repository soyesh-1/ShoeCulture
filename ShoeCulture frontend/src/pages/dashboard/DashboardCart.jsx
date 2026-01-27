import { useEffect, useState } from 'react'
import { request } from '../../utils/api.js'
import { getCart } from '../../utils/cart.js'
import '../../styles/DashboardPages.css'

const formatPrice = (value) => `Rs ${value.toLocaleString()}`

function DashboardCart() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCart = async () => {
      const cart = getCart()
      if (cart.length === 0) {
        setItems([])
        setLoading(false)
        return
      }
      const products = await Promise.all(
        cart.map((item) => request(`/products/${item.productId}`))
      )
      setItems(
        cart.map((item) => ({
          product: products.find((p) => p._id === item.productId),
          quantity: item.quantity,
        }))
      )
      setLoading(false)
    }
    loadCart()
  }, [])

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Cart</h2>
        {loading ? <p>Loading cart...</p> : null}
        {!loading && items.length === 0 ? <p>Your cart is empty.</p> : null}
        <div className="table">
          {items.map((item) => (
            <div key={item.product._id} className="table-row">
              <span>{item.product.name}</span>
              <span>{item.quantity}x</span>
              <span>{formatPrice(item.product.price)}</span>
            </div>
          ))}
        </div>
        {items.length > 0 ? (
          <div className="summary">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DashboardCart
