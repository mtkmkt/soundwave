import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Library from './pages/Library'
import Search from './pages/Search'
import ArtistPage from './pages/ArtistPage'
import AlbumPage from './pages/AlbumPage'
import PlaylistPage from './pages/PlaylistPage'
import ArtistDashboard from './pages/ArtistDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="loading-screen"><span className="spinner"/></div>
  return user ? children : <Navigate to="/login" replace />
}

function ArtistRoute({ children }) {
  const { profile } = useAuthStore()
  return profile?.role === 'artist' ? children : <Navigate to="/" replace />
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: '#282828', color: '#fff', borderRadius: '8px' }
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Browse />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="artist/:id" element={<ArtistPage />} />
          <Route path="album/:id" element={<AlbumPage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
          <Route path="dashboard" element={<ArtistRoute><ArtistDashboard /></ArtistRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}