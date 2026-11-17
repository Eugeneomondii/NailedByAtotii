import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAdmin from './components/RequireAdmin'
import Home from './pages/Home'
import Services from './pages/Services'
import Book from './pages/Book'
import Gallery from './pages/Gallery'
import About from './pages/About'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <Routes>
      {/* Public site: has the navbar and footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book" element={<Book />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Admin: no public navbar or footer */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Dashboard />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}