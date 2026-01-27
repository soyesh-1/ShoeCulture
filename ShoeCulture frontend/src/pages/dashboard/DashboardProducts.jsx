import { useEffect, useState } from 'react'
import { request } from '../../utils/api.js'
import '../../styles/DashboardPages.css'

const formatPrice = (value) => `Rs ${value.toLocaleString()}`

function DashboardProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        imageUrl: form.imageUrl.trim(),
      }
      const created = await request('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setProducts((prev) => [created, ...prev])
      setForm({ name: '', description: '', price: '', imageUrl: '' })
      setSuccess('Product created.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Products</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="price">Price (Rs)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field field-full">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://"
            />
          </div>
          <div className="field field-full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          {error ? <div className="error">{error}</div> : null}
          {success ? <div className="success">{success}</div> : null}
          <div className="form-actions">
            <button className="solid" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add product'}
            </button>
          </div>
        </form>
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
