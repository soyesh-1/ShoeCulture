import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../utils/api.js'
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../utils/cart.js'
import '../styles/Cart.css'

const formatPrice = (value) => `Rs ${value.toLocaleString()}`

function Cart() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const loadCart = async () => {
      const cart = getCart()
      if (cart.length === 0) {
        setItems([])
        setLoading(false)
        return
      }
      try {
        const products = await Promise.all(
          cart.map((item) => request(`/products/${item.productId}`))
        )
        const mapped = cart.map((item) => {
          const product = products.find((p) => p._id === item.productId)
          return {
            product,
            quantity: item.quantity,
          }
        })
        setItems(mapped)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadCart()
    const loadSession = async () => {
      try {
        await request('/users/me')
        setIsAuthed(true)
      } catch (err) {
        setIsAuthed(false)
      }
    }
    loadSession()
  }, [])

  const handleQuantity = (productId, quantity) => {
    const next = updateQuantity(productId, quantity)
    setItems((prev) =>
      prev.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: next.find((c) => c.productId === productId).quantity }
          : item
      )
    )
  }

  const handleRemove = (productId) => {
    removeFromCart(productId)
    setItems((prev) => prev.filter((item) => item.product._id !== productId))
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const handleCheckout = async () => {
    try {
      if (!isAuthed) {
        setError('Please sign in to checkout.')
        return
      }
      const payload = {
        items: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
      }
      const data = await request('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="cart">
      <h1>Your cart</h1>
      {loading ? <p>Loading cart...</p> : null}
      {error ? <div className="error">{error}</div> : null}
      {!loading && items.length === 0 ? (
        <div className="empty">
          <p>Your cart is empty.</p>
          <Link className="ghost" to="/shop">
            Go shopping
          </Link>
        </div>
      ) : null}
      <div className="cart-list">
        {items.map((item) => (
          <div key={item.product._id} className="cart-item">
            <div>
              <h3>{item.product.name}</h3>
              <p>{formatPrice(item.product.price)}</p>
            </div>
            <div className="cart-actions">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) =>
                  handleQuantity(item.product._id, Number(event.target.value))
                }
              />
              <button
                className="ghost"
                type="button"
                onClick={() => handleRemove(item.product._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 ? (
        <div className="cart-summary">
          <div>
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div className="cart-buttons">
            <button className="ghost" type="button" onClick={clearCart}>
              Clear cart
            </button>
            <button className="solid" type="button" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Cart
