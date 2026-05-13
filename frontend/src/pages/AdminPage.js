import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Alert } from 'react-bootstrap';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaChartBar,
  FaTachometerAlt,
  FaTicketAlt,
  FaCalendarAlt,
  FaBus,
  FaUsers,
  FaTools,
  FaArrowLeft,
  FaSync,
  FaBolt,
  FaCity
} from 'react-icons/fa';

function AdminPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBuses: 0,
    totalUsers: 0,
    todayBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Навигационные ссылки админ-панели
  const navItems = [
    { path: '/admin', label: 'Статистика', icon: FaChartBar, exact: true },
    { path: '/admin/dispatcher', label: 'Панель диспетчера', icon: FaTachometerAlt },
    { path: '/admin/bookings', label: 'Бронирования', icon: FaTicketAlt },
    { path: '/admin/schedules', label: 'Расписание', icon: FaCalendarAlt },
    { path: '/admin/buses', label: 'Автобусы', icon: FaBus },
    { path: '/admin/cities', label: 'Города', icon: FaCity },
    { path: '/admin/users', label: 'Пользователи', icon: FaUsers }
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Получаем реальные данные с API
      const [bookingsRes, busesRes, usersRes, schedulesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/bookings/', { headers }).catch(() => ({ data: [] })),
        axios.get('http://localhost:8000/api/buses/', { headers }).catch(() => ({ data: [] })),
        axios.get('http://localhost:8000/api/users/', { headers }).catch(() => ({ data: [] })),
        axios.get('http://localhost:8000/api/buses/schedules/', { headers }).catch(() => ({ data: [] }))
      ]);

      const bookings = bookingsRes.data || [];
      const buses = busesRes.data || [];
      const users = usersRes.data || [];
      const schedules = schedulesRes.data || [];

      // Вычисляем статистику
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.booking_date).toISOString().split('T')[0];
        return bookingDate === today;
      });

      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'paid')
        .reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0);

      const pendingBookings = bookings.filter(b => b.status === 'pending').length;

      setStats({
        totalBookings: bookings.length,
        activeBuses: buses.length,
        totalUsers: users.length,
        todayBookings: todayBookings.length,
        totalRevenue: Math.round(totalRevenue),
        pendingBookings: pendingBookings
      });
    } catch (err) {
      setError('Ошибка загрузки статистики. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body className="text-center">
        <div className={`mb-3 text-${color}`}>
          <Icon size={40} />
        </div>
        <h3 className={`text-${color} mb-1 fw-bold`}>
          {loading ? '...' : value}
        </h3>
        <h6 className="text-muted mb-2">{title}</h6>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </Card.Body>
    </Card>
  );

  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container fluid>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start py-3">
            <h2 className="mb-2 mb-md-0" style={{ color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaTools />
              Административная панель
            </h2>
            <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
              <Link to="/" className="btn btn-outline-primary flex-grow-1 flex-md-grow-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaArrowLeft />
                <span className="d-none d-sm-inline">Вернуться на сайт</span>
                <span className="d-sm-none">На сайт</span>
              </Link>
              <Button
                variant="outline-secondary"
                onClick={fetchDashboardStats}
                className="flex-grow-1 flex-md-grow-0"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaSync />
                <span className="d-none d-sm-inline">Обновить</span>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="py-4">
        <Row className="g-4">
          {/* Sidebar Navigation */}
          <Col md={3} lg={2} className="mb-4 mb-md-0">
            <Card className="admin-sidebar">
              <Card.Body className="p-0">
                <Nav className="flex-column">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.path}
                        as={Link}
                        className={`admin-nav-link ${
                          isActiveLink(item.path, item.exact) ? 'active' : ''
                        }`}
                        onClick={() => navigate(item.path)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                      >
                        <IconComponent size={18} />
                        {item.label}
                      </div>
                    );
                  })}
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col md={9} lg={10}>
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Dashboard Statistics */}
            {location.pathname === '/admin' && (
              <>
                <Row className="mb-4">
                  <Col>
                    <h4 className="mb-3" style={{ color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaChartBar />
                      Общая статистика
                    </h4>
                  </Col>
                </Row>

                <Row className="g-4 mb-5">
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Всего бронирований"
                      value={stats.totalBookings}
                      icon={FaTicketAlt}
                      color="primary"
                      subtitle="За все время"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Активных автобусов"
                      value={stats.activeBuses}
                      icon={FaBus}
                      color="success"
                      subtitle="В работе сегодня"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Зарегистрированных пользователей"
                      value={stats.totalUsers}
                      icon={FaUsers}
                      color="info"
                      subtitle="Всего в системе"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Бронирований за сегодня"
                      value={stats.todayBookings}
                      icon={FaCalendarAlt}
                      color="warning"
                      subtitle="Сегодняшние заказы"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Общая выручка (руб.)"
                      value={stats.totalRevenue.toLocaleString()}
                      icon={FaChartBar}
                      color="success"
                      subtitle="За все время"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="На проверке"
                      value={stats.pendingBookings}
                      icon={FaTicketAlt}
                      color="warning"
                      subtitle="Требуют внимания"
                    />
                  </Col>
                </Row>

                {/* Quick Actions */}
                <Row>
                  <Col>
                    <Card className="shadow-sm border-0">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaBolt />
                          Быстрые действия
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex flex-wrap gap-3">
                          <Button as={Link} to="/admin/dispatcher" variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaTachometerAlt />
                            Панель диспетчера
                          </Button>
                          <Button as={Link} to="/admin/bookings" variant="outline-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaTicketAlt />
                            Управление бронированиями
                          </Button>
                          <Button as={Link} to="/admin/schedules" variant="outline-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCalendarAlt />
                            Расписание рейсов
                          </Button>
                          <Button as={Link} to="/admin/buses" variant="outline-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaBus />
                            Автобусы
                          </Button>
                          <Button as={Link} to="/admin/users" variant="outline-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUsers />
                            Пользователи
                          </Button>
                          <Button as={Link} to="/admin/cities" variant="outline-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCity />
                            Города
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            {/* Children Components */}
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminPage;
