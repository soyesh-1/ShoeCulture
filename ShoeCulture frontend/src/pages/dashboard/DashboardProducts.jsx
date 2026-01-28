import { useEffect, useState } from 'react'
import { request, requestMultipart } from '../../utils/api.js'
import useSession from './useSession.js'
import '../../styles/DashboardPages.css'

const formatPrice = (value) => `Rs ${value.toLocaleString()}`

function DashboardProducts() {
  const { profile, loading: sessionLoading } = useSession()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

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

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setSuccess('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const data = await requestMultipart('/uploads/images', formData)
      setForm((prev) => ({ ...prev, imageUrl: data.url }))
      setSuccess('Image uploaded.')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
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
      if (editingId) {
        const updated = await request(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setProducts((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item))
        )
        setSuccess('Product updated.')
      } else {
        const created = await request('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setProducts((prev) => [created, ...prev])
        setSuccess('Product created.')
      }
      setForm({ name: '', description: '', price: '', imageUrl: '' })
      setEditingId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl || '',
    })
    setError('')
    setSuccess('')
  }

  const handleDelete = async (productId) => {
    setError('')
    setSuccess('')
    try {
      await request(`/products/${productId}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((item) => item._id !== productId))
      setSuccess('Product removed.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Products</h2>
        {!sessionLoading && profile?.role === 'admin' ? (
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
              required
            />
          </div>
          <div className="field field-full">
            <label htmlFor="imageUpload">Upload image (admin)</label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
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
                {submitting
                  ? 'Saving...'
                  : editingId
                  ? 'Update product'
                  : 'Add product'}
              </button>
              {editingId ? (
                <button
                  className="ghost"
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm({
                      name: '',
                      description: '',
                      price: '',
                      imageUrl: '',
                    })
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
        {!sessionLoading && !profile ? (
          <p>Please sign in to manage products.</p>
        ) : null}
        {!sessionLoading && profile && profile.role !== 'admin' ? (
          <p>Admin access required to manage products.</p>
        ) : null}
        {loading ? <p>Loading products...</p> : null}
        {!loading && products.length === 0 ? <p>No products yet.</p> : null}
        <div className="dashboard-products">
          {products
            .filter((product) => product.imageUrl)
            .map((product) => (
              <div key={product._id} className="dashboard-product-card">
                <img src={product.imageUrl} alt={product.name} />
                <div className="product-meta">
                  <div>
                    <h3>{product.name}</h3>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  <div className="product-actions">
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="ghost danger"
                      type="button"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardProducts
