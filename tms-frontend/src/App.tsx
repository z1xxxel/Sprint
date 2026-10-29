import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './store/auth'

import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import MyOrders from './pages/MyOrders'
import Users from './pages/Users'
import PublicProfile from './pages/PublicProfile'
import Chats from './pages/Chats'
import Manage from './pages/Manage'
import Cart from './pages/Cart'
import Favorites from './pages/Favorites'
import Events from './pages/Events'
import Quests from './pages/Quests'
import CoinsHistory from './pages/CoinsHistory'
import RatingHistory from './pages/RatingHistory'
import CategoryProducts from './pages/CategoryProducts'
import Seasons from './pages/Seasons'
import Surveys from './pages/Surveys'
import Thanks from './pages/Thanks'
import Support from './pages/Support'
import TicketChatPage from './pages/TicketChat'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'

function Protected({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user)
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="catalog/:id" element={<ProductDetail />} />
          <Route path="catalog/category/:categoryId" element={<CategoryProducts />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<PublicProfile />} />
          <Route path="chats" element={<Chats />} />
          <Route path="chats/:id" element={<Chats />} />
          <Route path="cart" element={<Cart />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="events" element={<Events />} />
          <Route path="quests" element={<Quests />} />
          <Route path="seasons" element={<Seasons />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="thanks" element={<Thanks />} />
          <Route path="support" element={<Support />} />
          <Route path="support/tickets/:id" element={<TicketChatPage />} />
          <Route path="history/coins" element={<CoinsHistory />} />
          <Route path="history/rating" element={<RatingHistory />} />
          <Route path="manage" element={<Manage />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}