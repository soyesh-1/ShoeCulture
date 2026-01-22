import '../styles/Verification.css'

function Verification() {
  return (
    <section id="verify" className="section">
      <div className="section-header">
        <h2>Seller verification in four steps</h2>
        <p>Trust is enforced through human review and automated checks.</p>
      </div>
      <div className="steps">
        <div className="step">
          <span className="step-index">01</span>
          <h3>Identity check</h3>
          <p>Upload ID, confirm email, and verify a phone number.</p>
        </div>
        <div className="step">
          <span className="step-index">02</span>
          <h3>Inventory review</h3>
          <p>Admin approval required before products go live.</p>
        </div>
        <div className="step">
          <span className="step-index">03</span>
          <h3>Secure payouts</h3>
          <p>Payouts only after delivery confirmation.</p>
        </div>
        <div className="step">
          <span className="step-index">04</span>
          <h3>Ongoing monitoring</h3>
          <p>High-risk activity triggers manual checks.</p>
        </div>
      </div>
    </section>
  )
}

export default Verification
