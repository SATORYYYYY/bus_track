import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import NavBar from './components/NavBar';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import AdminBookings from './pages/admin/AdminBookings';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminBuses from './pages/admin/AdminBuses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCities from './pages/admin/AdminCities';
import DispatcherDashboard from './pages/admin/DispatcherDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/booking/:scheduleId" element={<BookingPage />} />
          <Route path="/confirmation/:bookingCode" element={<ConfirmationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }>
            <Route index element={<div />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="buses" element={<AdminBuses />} />
            <Route path="cities" element={<AdminCities />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="dispatcher" element={<DispatcherDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;