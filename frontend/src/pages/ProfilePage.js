import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { Container, Card, Button, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaCalendarAlt,
  FaIdCard,
  FaSuitcase,
  FaEdit,
  FaSave,
  FaTimes,
  FaSignOutAlt,
  FaTicketAlt,
  FaMapMarkerAlt,
  FaClock,
  FaChair,
  FaTag,
  FaPercentage,
  FaQrcode,
  FaBus,
  FaArrowRight
} from 'react-icons/fa';

function ProfilePage() {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [profileData, setProfileData] = useState({
    full_name: '',
    birth_date: '',
    passport_number: '',
    has_luggage: false,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Не делаем редирект пока идет загрузка авторизации
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
    } else {
      fetchBookings();
      if (user.profile) {
        setProfileData(user.profile);
      }
    }
  }, [user, navigate, authLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get('http://localhost:8000/api/bookings/my/', { headers });
      setBookings(response.data);
    } catch (err) {
      setError('Не удалось загрузить бронирования');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.patch('http://localhost:8000/api/users/me/', { profile: profileData }, { headers });
      setEditing(false);
      setSuccess('Профиль успешно обновлен');
      setTimeout(() => setSuccess(null), 3000);
      window.location.reload();
    } catch (error) {
      setError('Ошибка при сохранении профиля');
    }
  };

  // Определение льготной категории по возрасту
  const getDiscountCategory = () => {
    if (!profileData.birth_date) return null;
    const birthDate = new Date(profileData.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age >= 60) return { type: 'pensioner', label: 'Пенсионер', discount: 50, color: 'success' };
    if (age <= 7) return { type: 'child', label: 'Ребенок до 7 лет', discount: 100, color: 'info' };
    return null;
  };

  const discountInfo = getDiscountCategory();

  // Статистика пользователя
  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.final_price || b.schedule?.price || 0), 0);
  const upcomingTrips = bookings.filter(b => new Date(b.schedule?.departure_time) > new Date()).length;

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'info',
      confirmed: 'success',
      completed: 'secondary',
      cancelled: 'danger',
    };
    const labels = {
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      confirmed: 'Подтвержден',
      completed: 'Завершен',
      cancelled: 'Отменен',
    };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const getDiscountBadge = (discountType, discountPercent) => {
    if (!discountType || discountType === 'none') return null;
    const labels = {
      pensioner: 'Пенсионер',
      student: 'Студент',
      disabled: 'Инвалид',
      child: 'Ребенок',
    };
    return (
      <Badge bg="success" className="ms-2">
        <FaPercentage className="me-1" />
        {labels[discountType] || discountType}: {discountPercent}%
      </Badge>
    );
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4" style={{ fontSize: '2.2rem', color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <FaUser size={36} />
        Личный кабинет
      </h2>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      <Row>
        {/* Левая колонка - Профиль */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-lg h-100" style={{ borderRadius: '24px', border: '3px solid #5D111A' }}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#5D111A',
                    borderRadius: '50%',
                    color: 'white',
                    fontSize: '3rem'
                  }}
                >
                  <FaUser />
                </div>
                <h4 className="mb-1" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {user?.profile?.full_name || user?.username || 'Пользователь'}
                </h4>
                <p className="text-muted mb-0">{user?.email}</p>
              </div>

              {editing ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaUser /> ФИО
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaCalendarAlt /> Дата рождения
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="birth_date"
                      value={profileData.birth_date}
                      onChange={handleProfileChange}
                      style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaIdCard /> Паспорт
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="passport_number"
                      value={profileData.passport_number}
                      onChange={handleProfileChange}
                      placeholder="0000 000000"
                      style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label={<span style={{ fontSize: '1.1rem' }}><FaSuitcase className="me-2" />Багаж по умолчанию</span>}
                      name="has_luggage"
                      checked={profileData.has_luggage}
                      onChange={handleProfileChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      onClick={saveProfile}
                      style={{ fontSize: '1.2rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <FaSave /> Сохранить
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setEditing(false)}
                      style={{ fontSize: '1.2rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <FaTimes /> Отмена
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="me-2 text-muted" />
                      <span className="text-muted">Дата рождения:</span>
                    </div>
                    <strong style={{ fontSize: '1.1rem' }}>
                      {user?.profile?.birth_date
                        ? new Date(user.profile.birth_date).toLocaleDateString('ru-RU')
                        : 'Не указано'}
                    </strong>
                  </div>

                  <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                    <div className="d-flex align-items-center mb-2">
                      <FaIdCard className="me-2 text-muted" />
                      <span className="text-muted">Паспорт:</span>
                    </div>
                    <strong style={{ fontSize: '1.1rem' }}>
                      {user?.profile?.passport_number || 'Не указано'}
                    </strong>
                  </div>

                  <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                    <div className="d-flex align-items-center mb-2">
                      <FaSuitcase className="me-2 text-muted" />
                      <span className="text-muted">Багаж по умолчанию:</span>
                    </div>
                    <strong style={{ fontSize: '1.1rem' }}>
                      {user?.profile?.has_luggage ? 'Да' : 'Нет'}
                    </strong>
                  </div>

                  {/* Блок льгот */}
                  {discountInfo && (
                    <div className="mb-4 p-3" style={{ backgroundColor: '#d4edda', borderRadius: '12px', border: '2px solid #28a745' }}>
                      <div className="d-flex align-items-center mb-2">
                        <FaTag className="me-2 text-success" />
                        <span className="text-success fw-bold">Ваша льгота:</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <strong style={{ fontSize: '1.2rem', color: '#155724' }}>{discountInfo.label}</strong>
                        <Badge bg="success" style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}>
                          -{discountInfo.discount}%
                        </Badge>
                      </div>
                      <small className="text-muted">Применяется автоматически при бронировании</small>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => setEditing(true)}
                      style={{ fontSize: '1.2rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <FaEdit /> Редактировать профиль
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleLogout}
                      style={{ fontSize: '1.2rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <FaSignOutAlt /> Выйти
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Правая колонка - Статистика и бронирования */}
        <Col lg={8}>
          {/* Статистика */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="shadow-sm h-100" style={{ borderRadius: '16px' }}>
                <Card.Body className="text-center p-4">
                  <FaTicketAlt size={40} className="text-primary mb-3" />
                  <h3 className="text-primary mb-1" style={{ fontSize: '2rem' }}>{totalBookings}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Всего поездок</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="shadow-sm h-100" style={{ borderRadius: '16px' }}>
                <Card.Body className="text-center p-4">
                  <FaBus size={40} className="text-success mb-3" />
                  <h3 className="text-success mb-1" style={{ fontSize: '2rem' }}>{upcomingTrips}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Предстоящие</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="shadow-sm h-100" style={{ borderRadius: '16px' }}>
                <Card.Body className="text-center p-4">
                  <FaTag size={40} className="text-info mb-3" />
                  <h3 className="text-info mb-1" style={{ fontSize: '2rem' }}>{totalSpent.toLocaleString()} ₽</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Потрачено</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Бронирования */}
          <Card className="shadow-sm" style={{ borderRadius: '24px' }}>
            <Card.Header
              className="bg-white"
              style={{
                padding: '1.5rem',
                borderRadius: '24px 24px 0 0',
                borderBottom: '2px solid #e9ecef'
              }}
            >
              <h4 className="mb-0" style={{ fontSize: '1.5rem', color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaTicketAlt />
                Мои бронирования
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center p-5">
                  <FaTicketAlt size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">У вас пока нет бронирований</h5>
                  <Button
                    as={Link}
                    to="/"
                    variant="primary"
                    className="mt-3"
                    style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem' }}
                  >
                    Найти рейс
                  </Button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {bookings.map(booking => (
                    <Card
                      key={booking.id}
                      className="border-0 shadow-sm"
                      style={{ borderRadius: '16px', backgroundColor: '#f8f9fa' }}
                    >
                      <Card.Body className="p-4">
                        <Row className="align-items-center">
                          <Col md={8}>
                            <div className="d-flex align-items-center mb-3">
                              <FaMapMarkerAlt className="text-primary me-2" size={20} />
                              <h5 className="mb-0" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                                {booking.schedule?.route?.origin_name} <FaArrowRight className="mx-2 text-muted" size={16} /> {booking.schedule?.route?.destination_name}
                              </h5>
                            </div>

                            <div className="d-flex flex-wrap gap-3 mb-3">
                              <div className="d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
                                <FaClock className="me-2 text-muted" />
                                {new Date(booking.schedule?.departure_time).toLocaleDateString('ru-RU', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
                                <FaChair className="me-2 text-muted" />
                                Место: <strong className="ms-1">{booking.seat_number}</strong>
                              </div>
                            </div>

                            <div className="d-flex align-items-center flex-wrap gap-2">
                              {getStatusBadge(booking.status)}
                              {getDiscountBadge(booking.discount_type, booking.discount_percent)}
                              <Badge bg="secondary" style={{ fontSize: '0.9rem' }}>
                                <FaQrcode className="me-1" />
                                {booking.booking_code}
                              </Badge>
                            </div>
                          </Col>

                          <Col md={4} className="text-md-end mt-3 mt-md-0">
                            <div className="mb-3">
                              {booking.discount_type && booking.discount_type !== 'none' ? (
                                <>
                                  <div className="text-muted" style={{ fontSize: '1rem', textDecoration: 'line-through' }}>
                                    {booking.schedule?.price?.toLocaleString()} ₽
                                  </div>
                                  <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                    {booking.final_price?.toLocaleString()} ₽
                                  </div>
                                </>
                              ) : (
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                  {booking.final_price?.toLocaleString() || booking.schedule?.price?.toLocaleString()} ₽
                                </div>
                              )}
                            </div>
                            <Button
                              as={Link}
                              to={`/confirmation/${booking.booking_code}`}
                              variant="outline-primary"
                              style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}
                            >
                              Подробнее
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
