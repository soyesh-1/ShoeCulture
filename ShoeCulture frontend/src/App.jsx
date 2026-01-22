import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import Login from './pages/Login.jsx'
import MfaVerify from './pages/MfaVerify.jsx'
import Account from './pages/Account.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mfa" element={<MfaVerify />} />
      <Route path="/account" element={<Account />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products/:id" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  )
}

export default App
