
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { lazy, Suspense } from "react"

import { AuthProvider, useAuth } from "./hooks/useAuth.jsx"
import { ThemeProvider } from "./hooks/useTheme.jsx"

/* ══ LAZY LOADING (Performance Boost) ══ */
const Login           = lazy(() => import("./pages/Login"))
const Register        = lazy(() => import("./pages/Register"))
const Home            = lazy(() => import("./pages/Home"))
const Reels           = lazy(() => import("./pages/Reels"))
const Upload          = lazy(() => import("./pages/Upload"))
const Profile         = lazy(() => import("./pages/Profile"))
const Search          = lazy(() => import("./pages/Search"))
const Notifications   = lazy(() => import("./pages/Notifications"))
const Messages        = lazy(() => import("./pages/Messages"))
const Events          = lazy(() => import("./pages/Events"))
const UserProfile     = lazy(() => import("./pages/UserProfile"))
const Landing         = lazy(() => import("./pages/Landing"))
const Communities     = lazy(() => import("./pages/Communities"))
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"))
const RoommateFinder  = lazy(() => import("./pages/RoommateFinder"))
const LostFound       = lazy(() => import("./pages/LostFound"))

/* ══ LOADING SCREEN ══ */
function LoadingScreen() {
  return (
    <div className="loader-container">
      <div className="loader" />
    </div>
  )
}

/* ══ ROUTE GUARDS ══ */
function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}

function GuestLayout() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/home" replace />
  return <Outlet />
}

/* ══ ROUTES ══ */
function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>

        {/* Guest Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/events" element={<Events />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/community/:slug" element={<CommunityDetail />} />
          <Route path="/roommates" element={<RoommateFinder />} />
          <Route path="/lostfound" element={<LostFound />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  )
}

/* ══ MAIN APP ══ */
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