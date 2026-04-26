// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx"
import { ThemeProvider } from "./hooks/useTheme.jsx"

import Login          from "./pages/Login"
import Register       from "./pages/Register"
import Home           from "./pages/Home"
import Reels          from "./pages/Reels"
import Upload         from "./pages/Upload"
import Profile        from "./pages/Profile"
import Search         from "./pages/Search"
import Notifications  from "./pages/Notifications"
import Messages       from "./pages/Messages"
import Events         from "./pages/Events"
import UserProfile    from "./pages/UserProfile"
import Landing        from "./pages/Landing"
import Communities    from "./pages/Communities"
import CommunityDetail from "./pages/CommunityDetail"
import RoommateFinder from "./pages/RoommateFinder"
import LostFound      from "./pages/LostFound"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user)    return <Navigate to="/home" replace />
  return children
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg-page)" }}>
      <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid rgba(99,102,241,0.15)", borderTopColor:"#6366f1", animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} style={{ minHeight:"100vh" }}>
      <Routes location={location}>
        <Route path="/"           element={<GuestRoute><Landing /></GuestRoute>} />
        <Route path="/login"      element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register"   element={<GuestRoute><Register /></GuestRoute>} />

        <Route path="/home"          element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/reels"         element={<ProtectedRoute><Reels /></ProtectedRoute>} />
        <Route path="/upload"        element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/user/:id"      element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/search"        element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/messages"      element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/events"        element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/communities"   element={<ProtectedRoute><Communities /></ProtectedRoute>} />
        <Route path="/community/:slug" element={<ProtectedRoute><CommunityDetail /></ProtectedRoute>} />
        <Route path="/roommates"     element={<ProtectedRoute><RoommateFinder /></ProtectedRoute>} />
        <Route path="/lostfound"     element={<ProtectedRoute><LostFound /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}