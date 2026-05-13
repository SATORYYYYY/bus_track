import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaCheckCircle, FaTimesCircle, FaEye, FaSearch, FaSync } from 'react-icons/fa';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get('http://localhost:8000/api/bookings/', { headers });
      setBookings(response.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError('Ошибка загрузки бронирований. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'info',
      confirmed: 'success',
      completed: 'secondary',
      cancelled: 'danger'
    };
    const labels = {
      pending: 'На проверке',
      paid: 'Оплачен',
      confirmed: 'Подтвержден',
      completed: 'Завершен',
      cancelled: 'Отменен'
    };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' ? true : booking.status === filter;
    const matchesSearch = 
      (booking.booking_code?.toLowerCase().includes(search.toLowerCase())) ||
      (booking.passenger_name?.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.patch(`http://localhost:8000/api/bookings/${bookingId}/pay/`, { status: newStatus }, { headers });
      fetchBookings(); // Обновляем список
    } catch (err) {
      setError('Ошибка при обновлении статуса');
    }
  };

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'paid' || b.status === 'completed')
    .reduce((sum, booking) => sum + (parseFloat(booking.final_price) || 0), 0);

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h4 className="mb-3" style={{ color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaTicketAlt />
            Управление бронированиями
          </h4>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-primary mb-1">{bookings.length}</h5>
              <small className="text-muted">Всего бронирований</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-success mb-1">{bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length}</h5>
              <small className="text-muted">Подтверждено</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-warning mb-1">{bookings.filter(b => b.status === 'pending').length}</h5>
              <small className="text-muted">На проверке</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-success mb-1">{totalRevenue.toLocaleString()} ₽</h5>
              <small className="text-muted">Общая выручка</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Фильтры и поиск */}
      <Card className="admin-search-filter mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3} className="mb-2 mb-md-0">
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-100"
              >
                <option value="all">Все бронирования</option>
                <option value="pending">На проверке</option>
                <option value="paid">Оплачены</option>
                <option value="confirmed">Подтверждены</option>
                <option value="completed">Завершены</option>
                <option value="cancelled">Отменены</option>
              </Form.Select>
            </Col>
            <Col md={6} className="mb-2 mb-md-0">
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Поиск по коду или имени..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Button 
                variant="outline-secondary" 
                className="w-100" 
                onClick={fetchBookings}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <FaSync />
                Обновить
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Таблица бронирований */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h6 className="mb-0">Список бронирований ({filteredBookings.length})</h6>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <FaTicketAlt size={64} className="mb-3" />
              <h5>Нет бронирований</h5>
              <p>По вашему запросу ничего не найдено</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="admin-table">
                <thead>
                  <tr>
                    <th>Код брони</th>
                    <th>Пассажир</th>
                    <th>Маршрут</th>
                    <th>Дата/Время</th>
                    <th>Место</th>
                    <th>Льгота</th>
                    <th>Стоимость</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id}>
                      <td className="fw-bold">{booking.booking_code}</td>
                      <td>{booking.passenger_name}</td>
                      <td>
                        {booking.schedule?.route?.origin_name} → {booking.schedule?.route?.destination_name}
                      </td>
                      <td>
                        {booking.schedule?.departure_time && (
                          <>
                            {new Date(booking.schedule.departure_time).toLocaleDateString('ru-RU')}
                            <br />
                            <small className="text-muted">
                              {new Date(booking.schedule.departure_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </>
                        )}
                      </td>
                      <td>{booking.seat_number}</td>
                      <td>
                        {booking.discount_type && booking.discount_type !== 'none' ? (
                          <Badge bg="info">{booking.discount_type}</Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {booking.final_price ? (
                          <div>
                            {parseFloat(booking.final_price).toLocaleString()} ₽
                            {booking.discount_type && booking.discount_type !== 'none' && (
                              <div>
                                <small className="text-muted text-decoration-line-through">
                                  {parseFloat(booking.schedule?.price || 0).toLocaleString()} ₽
                                </small>
                              </div>
                            )}
                          </div>
                        ) : (
                          `${parseFloat(booking.schedule?.price || 0).toLocaleString()} ₽`
                        )}
                      </td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <div className="admin-action-buttons">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                className="admin-action-btn"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <FaCheckCircle />
                                <span className="d-none d-md-inline">Подтвердить</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                className="admin-action-btn"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <FaTimesCircle />
                                <span className="d-none d-md-inline">Отменить</span>
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline-primary" className="admin-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FaEye />
                            <span className="d-none d-md-inline">Просмотр</span>
                          </Button>
                        </div>
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

export default AdminBookings;
