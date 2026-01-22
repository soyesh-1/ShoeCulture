import '../styles/Security.css'

function Security() {
  return (
    <section id="secure" className="section dark">
      <div className="section-header">
        <h2>Security is the product</h2>
        <p>Zero-trust workflows keep buyers and sellers safe.</p>
      </div>
      <div className="security-grid">
        <div className="security-card">
          <h3>MFA with email OTP</h3>
          <p>Login stays locked until a verified OTP is confirmed.</p>
        </div>
        <div className="security-card">
          <h3>Role-based control</h3>
          <p>Buyer, seller, and admin actions are tightly scoped.</p>
        </div>
        <div className="security-card">
          <h3>Signed orders</h3>
          <p>Every checkout is hashed to prevent tampering.</p>
        </div>
        <div className="security-card">
          <h3>Audit trail</h3>
          <p>Immutable logs show who did what, and when.</p>
        </div>
      </div>
    </section>
  )
}

export default Security
