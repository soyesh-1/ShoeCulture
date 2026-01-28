import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import MfaVerify from './pages/MfaVerify.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import DashboardLayout from './pages/dashboard/DashboardLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import DashboardProducts from './pages/dashboard/DashboardProducts.jsx'
import DashboardCart from './pages/dashboard/DashboardCart.jsx'
import DashboardOrders from './pages/dashboard/DashboardOrders.jsx'
import DashboardUsers from './pages/dashboard/DashboardUsers.jsx'
import DashboardSecurity from './pages/dashboard/DashboardSecurity.jsx'
import DashboardSettings from './pages/dashboard/DashboardSettings.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/mfa" element={<MfaVerify />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products/:id" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route
          path="products"
          element={
            <RequireAdmin>
              <DashboardProducts />
            </RequireAdmin>
          }
        />
        <Route path="cart" element={<DashboardCart />} />
        <Route path="orders" element={<DashboardOrders />} />
        <Route
          path="users"
          element={
            <RequireAdmin>
              <DashboardUsers />
            </RequireAdmin>
          }
        />
        <Route
          path="security"
          element={
            <RequireAdmin>
              <DashboardSecurity />
            </RequireAdmin>
          }
        />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>
    </Routes>
  )
}

export default App
