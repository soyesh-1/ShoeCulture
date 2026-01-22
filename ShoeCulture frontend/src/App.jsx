import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import Login from './pages/Login.jsx'
import MfaVerify from './pages/MfaVerify.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mfa" element={<MfaVerify />} />
    </Routes>
  )
}

export default App
