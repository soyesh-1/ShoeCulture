import '../styles/Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">Secure sneaker commerce</p>
        <h1>
          Collect, trade, and buy with security built in. ShoeCulture keeps every
          transaction locked.
        </h1>
        <p className="subhead">
          MFA login, tamper-proof orders, and verified sellers protect every step
          from cart to doorstep.
        </p>
        <div className="hero-actions">
          <button className="solid">Browse Drops</button>
          <button className="ghost">Start Selling</button>
        </div>
        <div className="trust-row">
          <div>
            <span className="stat">12k+</span>
            <span className="stat-label">Active buyers</span>
          </div>
          <div>
            <span className="stat">99.9%</span>
            <span className="stat-label">Secure checkouts</span>
          </div>
          <div>
            <span className="stat">24/7</span>
            <span className="stat-label">Fraud monitoring</span>
          </div>
        </div>
      </div>
      <div className="hero-card">
        <div className="hero-card-header">
          <span>Live Drop</span>
          <span className="pill">Verified</span>
        </div>
        <h3>Midnight Voltage</h3>
        <p>Limited pairs, escrow protected.</p>
        <div className="hero-card-grid">
          <div>
            <p className="label">Price</p>
            <p className="value">Rs 18,900</p>
          </div>
          <div>
            <p className="label">Auth</p>
            <p className="value">2-step OTP</p>
          </div>
          <div>
            <p className="label">Lock</p>
            <p className="value">AES-256</p>
          </div>
          <div>
            <p className="label">Risk</p>
            <p className="value">Low</p>
          </div>
        </div>
        <button className="solid full">Reserve Pair</button>
      </div>
    </section>
  )
}

export default Hero
