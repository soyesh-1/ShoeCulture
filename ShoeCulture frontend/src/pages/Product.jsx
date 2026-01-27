import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { request } from '../utils/api.js'
import { addToCart } from '../utils/cart.js'
import '../styles/Product.css'

const formatPrice = (value) => `Rs ${value.toLocaleString()}`

function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await request(`/products/${id}`)
        setProduct(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  return (
    <div className="product">
      {loading ? <p>Loading product...</p> : null}
      {error ? (
        <div className="error">
          {error} <Link to="/shop">Back to shop</Link>
        </div>
      ) : null}
      {product ? (
        <div className="product-card">
          {product.imageUrl ? (
            <img
              className="product-image"
              src={product.imageUrl}
              alt={product.name}
            />
          ) : null}
          <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <div className="price">{formatPrice(product.price)}</div>
          </div>
          <div className="product-actions">
            <button
              className="solid"
              type="button"
              onClick={() => addToCart(product._id)}
            >
              Add to cart
            </button>
            <Link className="ghost" to="/cart">
              Go to cart
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Product
