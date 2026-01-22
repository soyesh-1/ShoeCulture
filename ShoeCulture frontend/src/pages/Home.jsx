import NavBar from '../components/NavBar.jsx'
import Hero from '../components/Hero.jsx'
import Drops from '../components/Drops.jsx'
import Footer from '../components/Footer.jsx'
import '../styles/Home.css'

function Home() {
  const drops = [
    {
      name: 'Apex Runner',
      tag: 'Performance',
      price: 'Rs 12,500',
    },
    {
      name: 'Vault Street',
      tag: 'Lifestyle',
      price: 'Rs 9,800',
    },
    {
      name: 'Echo Court',
      tag: 'Retro',
      price: 'Rs 14,200',
    },
  ]

  return (
    <div className="app">
      <NavBar />
      <main>
        <Hero />
        <Drops drops={drops} />
      </main>
      <Footer />
    </div>
  )
}

export default Home
