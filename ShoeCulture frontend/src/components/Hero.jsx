import '../styles/Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">ShoeCulture</p>
        <h1>
          Shop clean, simple, and fast. Find your next pair in seconds.
        </h1>
        <p className="subhead">
          Browse the latest shoes, view details, and add to cart after login.
        </p>
      </div>
      <div className="hero-card">
        <div className="hero-card-header">
          <span>Featured</span>
          <span className="pill">In stock</span>
        </div>
        <h3>Midnight Voltage</h3>
        <p>Minimal design, daily comfort.</p>
        <div className="hero-card-grid">
          <div>
            <p className="label">Price</p>
            <p className="value">Rs 18,900</p>
          </div>
          <div>
            <p className="label">Sizes</p>
            <p className="value">7 - 11</p>
          </div>
          <div>
            <p className="label">Color</p>
            <p className="value">Black</p>
          </div>
          <div>
            <p className="label">Stock</p>
            <p className="value">24 pairs</p>
          </div>
        </div>
        <button className="solid full">View Product</button>
      </div>
    </section>
  )
}

export default Hero
