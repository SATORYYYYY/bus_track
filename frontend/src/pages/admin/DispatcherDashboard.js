import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaBus,
  FaUsers,
  FaMoneyBillWave,
  FaTag,
  FaSync,
  FaList,
  FaTicketAlt
} from 'react-icons/fa';

function DispatcherDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterRoute, setFilterRoute] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filterDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Получаем реальные данные с API
      const [schedulesRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/buses/schedules/', { headers }),
        axios.get('http://localhost:8000/api/bookings/', { headers })
      ]);

      const schedulesData = schedulesRes.data || [];
      const bookingsData = bookingsRes.data || [];

      // Фильтруем рейсы по выбранной дате
      const filteredSchedules = schedulesData.filter(schedule => {
        const scheduleDate = new Date(schedule.departure_time).toISOString().split('T')[0];
        return scheduleDate === filterDate;
      });

      // Получаем последние бронирования (последние 10)
      const recentBookings = bookingsData
        .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
        .slice(0, 10);

      setSchedules(filteredSchedules);
      setBookings(recentBookings);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError('Ошибка загрузки данных. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      full: 'warning',
      departed: 'info',
      cancelled: 'danger',
    };
    const labels = {
      active: 'Активен',
      full: 'Заполнен',
      departed: 'Отправлен',
      cancelled: 'Отменен',
    };
    return <Badge bg={variants[status] || 'secondary'} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{labels[status] || status}</Badge>;
  };

  const getDiscountLabel = (discount) => {
    const labels = {
      none: 'Нет',
      pensioner: 'Пенсионер',
      student: 'Студент',
      disabled: 'Инвалид',
      child: 'Ребенок',
    };
    return labels[discount] || discount;
  };

  const filteredSchedules = filterRoute === 'all'
    ? schedules
    : schedules.filter(s => {
        const routeName = `${s.route?.origin_name} → ${s.route?.destination_name}`;
        return routeName === filterRoute;
      });

  const uniqueRoutes = [...new Set(schedules.map(s => `${s.route?.origin_name} → ${s.route?.destination_name}`))];

  // Статистика
  const totalPassengers = schedules.reduce((sum, s) => sum + (s.booked_seats?.length || 0), 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0);
  const discountCount = bookings.filter(b => b.discount_type && b.discount_type !== 'none').length;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2 style={{ color: '#5D111A', fontSize: '2rem' }}>
            Панель диспетчера
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            Управление рейсами и мониторинг пассажиров
          </p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0d6efd' }}>
                <FaBus />
              </div>
              <h3 className="text-primary mb-1" style={{ fontSize: '2rem' }}>
                {schedules.length}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Рейсов на дату</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#198754' }}>
                <FaUsers />
              </div>
              <h3 className="text-success mb-1" style={{ fontSize: '2rem' }}>
                {totalPassengers}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Пассажиров</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#198754' }}>
                <FaMoneyBillWave />
              </div>
              <h3 className="text-success mb-1" style={{ fontSize: '2rem' }}>
                {totalRevenue.toLocaleString()} ₽
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Выручка</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0dcaf0' }}>
                <FaTag />
              </div>
              <h3 className="text-info mb-1" style={{ fontSize: '2rem' }}>
                {discountCount}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Льготных билетов</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Фильтры */}
      <Card className="mb-4 shadow-sm" style={{ borderRadius: '16px' }}>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Label style={{ fontSize: '1.1rem', fontWeight: '600' }}>Дата</Form.Label>
              <Form.Control
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
              />
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Label style={{ fontSize: '1.1rem', fontWeight: '600' }}>Маршрут</Form.Label>
              <Form.Select
                value={filterRoute}
                onChange={(e) => setFilterRoute(e.target.value)}
                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
              >
                <option value="all">Все маршруты</option>
                {uniqueRoutes.map(route => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="primary"
                onClick={fetchData}
                className="w-100"
                style={{ fontSize: '1.2rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <FaSync />
                Обновить данные
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Таблица рейсов */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <Card.Header className="bg-white" style={{ padding: '1.5rem', borderRadius: '16px 16px 0 0' }}>
          <h4 className="mb-0" style={{ fontSize: '1.5rem', color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaList />
            Список рейсов
          </h4>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <FaBus size={64} className="mb-3" />
              <h5>Нет рейсов на выбранную дату</h5>
              <p>Выберите другую дату или добавьте рейсы в расписание</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover style={{ fontSize: '1.1rem' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ padding: '1rem' }}>Маршрут</th>
                    <th style={{ padding: '1rem' }}>Отправление</th>
                    <th style={{ padding: '1rem' }}>Прибытие</th>
                    <th style={{ padding: '1rem' }}>Автобус</th>
                    <th style={{ padding: '1rem' }}>Занято мест</th>
                    <th style={{ padding: '1rem' }}>Цена</th>
                    <th style={{ padding: '1rem' }}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map(schedule => (
                    <tr key={schedule.id}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        {schedule.route?.origin_name} → {schedule.route?.destination_name}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {new Date(schedule.departure_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {new Date(schedule.arrival_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '1rem' }}>{schedule.bus?.number}</td>
                      <td style={{ padding: '1rem' }}>
                        <strong>{schedule.booked_seats?.length || 0}</strong> / {schedule.bus?.total_seats}
                        <div className="progress mt-1" style={{ height: '8px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${((schedule.booked_seats?.length || 0) / (schedule.bus?.total_seats || 1)) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{schedule.price} ₽</td>
                      <td style={{ padding: '1rem' }}>
                        {getStatusBadge(
                          (schedule.booked_seats?.length || 0) >= (schedule.bus?.total_seats || 0) ? 'full' : 'active'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Последние бронирования */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <Card.Header className="bg-white" style={{ padding: '1.5rem', borderRadius: '16px 16px 0 0' }}>
          <h4 className="mb-0" style={{ fontSize: '1.5rem', color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaTicketAlt />
            Последние бронирования
          </h4>
        </Card.Header>
        <Card.Body className="p-0">
          {bookings.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <FaTicketAlt size={64} className="mb-3" />
              <h5>Нет бронирований</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover style={{ fontSize: '1.1rem' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ padding: '1rem' }}>Код</th>
                    <th style={{ padding: '1rem' }}>Пассажир</th>
                    <th style={{ padding: '1rem' }}>Маршрут</th>
                    <th style={{ padding: '1rem' }}>Место</th>
                    <th style={{ padding: '1rem' }}>Льгота</th>
                    <th style={{ padding: '1rem' }}>Цена</th>
                    <th style={{ padding: '1rem' }}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{booking.booking_code}</td>
                      <td style={{ padding: '1rem' }}>{booking.passenger_name}</td>
                      <td style={{ padding: '1rem' }}>
                        {booking.schedule?.route?.origin_name} → {booking.schedule?.route?.destination_name}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Badge bg="primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                          {booking.seat_number}
                        </Badge>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {booking.discount_type && booking.discount_type !== 'none' ? (
                          <Badge bg="info" style={{ fontSize: '0.9rem' }}>
                            {getDiscountLabel(booking.discount_type)}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        {parseFloat(booking.final_price || booking.schedule?.price || 0).toLocaleString()} ₽
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Badge
                          bg={booking.status === 'confirmed' || booking.status === 'paid' ? 'success' : 'warning'}
                          style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
                        >
                          {booking.status === 'confirmed' || booking.status === 'paid' ? 'Подтверждено' : 'Ожидает'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default DispatcherDashboard;
