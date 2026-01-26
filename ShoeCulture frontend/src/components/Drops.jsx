import { Link } from 'react-router-dom'
import '../styles/Drops.css'

function Drops({ drops }) {
  return (
    <section id="drops" className="section">
      <div className="section-header">
        <h2>Fresh drops, vetted and verified</h2>
        <p>Every seller is reviewed before listing. Every order is signed.</p>
      </div>
      <div className="drops">
        {drops.map((drop) => (
          <article key={drop.name} className="drop-card">
            <div className="drop-badge">{drop.tag}</div>
            <h3>{drop.name}</h3>
            <p className="price">{drop.price}</p>
            <p className="drop-meta">Escrow protected. Shipment tracked.</p>
            <Link className="ghost full" to="/shop">
              View Details
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Drops
