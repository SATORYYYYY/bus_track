import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';
import { FaUsers, FaUser, FaUserShield, FaSearch, FaSync, FaEye, FaBan, FaCheck, FaStar } from 'react-icons/fa';

function AdminUsers() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Получаем пользователей и бронирования для статистики
      const [usersRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/users/', { headers }).catch(err => {
          console.error('Ошибка загрузки пользователей:', err);
          return { data: [] };
        }),
        axios.get('http://localhost:8000/api/bookings/', { headers }).catch(err => {
          console.error('Ошибка загрузки бронирований:', err);
          return { data: [] };
        })
      ]);

      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

      console.log('Загружено пользователей:', usersData.length);
      console.log('Загружено бронирований:', bookingsData.length);

      // Обогащаем данные пользователей статистикой
      const enrichedUsers = usersData.map(user => {
        const userBookings = bookingsData.filter(b => 
          b.user === user.id || 
          b.user?.id === user.id ||
          b.user_id === user.id
        );
        const totalSpent = userBookings.reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0);

        return {
          ...user,
          total_bookings: userBookings.length,
          total_spent: totalSpent,
          full_name: user.profile?.full_name || user.username,
          phone: user.profile?.passport_number || '-',
          registration_date: user.date_joined || new Date().toISOString(),
          is_active: user.is_active !== false
        };
      });

      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Ошибка fetchUsers:', err);
      setError('Ошибка загрузки пользователей. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive !== false 
      ? <Badge bg="success"><FaCheck className="me-1" />Активен</Badge>
      : <Badge bg="secondary"><FaBan className="me-1" />Неактивен</Badge>;
  };

  const getStaffBadge = (isStaff) => {
    return isStaff 
      ? <Badge bg="info"><FaUserShield className="me-1" />Админ</Badge> 
      : <Badge bg="light" text="dark"><FaUser className="me-1" />Пользователь</Badge>;
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' ? true : 
                         filter === 'staff' ? user.is_staff :
                         filter === 'active' ? user.is_active !== false :
                         user.is_active === false;
    
    const matchesSearch = 
      (user.username?.toLowerCase().includes(search.toLowerCase())) ||
      (user.email?.toLowerCase().includes(search.toLowerCase())) ||
      (user.full_name?.toLowerCase().includes(search.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.patch(`http://localhost:8000/api/users/${userId}/`, { is_active: newStatus === 'active' }, { headers });
      fetchUsers();
    } catch (err) {
      setError('Ошибка при обновлении статуса');
    }
  };

  const handleStaffToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.patch(`http://localhost:8000/api/users/${userId}/`, { is_staff: !currentStatus }, { headers });
      fetchUsers();
    } catch (err) {
      setError('Ошибка при изменении роли');
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active !== false).length;
  const staffUsers = users.filter(u => u.is_staff).length;
  const totalRevenue = users.reduce((sum, user) => sum + (user.total_spent || 0), 0);

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h4 className="mb-3" style={{ color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUsers />
            Управление пользователями
          </h4>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-primary mb-1">{totalUsers}</h5>
              <small className="text-muted">Всего пользователей</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-success mb-1">{activeUsers}</h5>
              <small className="text-muted">Активных</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-info mb-1">{staffUsers}</h5>
              <small className="text-muted">Администраторов</small>
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
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3} className="mb-2 mb-md-0">
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Все пользователи</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
                <option value="staff">Администраторы</option>
              </Form.Select>
            </Col>
            <Col md={6} className="mb-2 mb-md-0">
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Поиск по имени, email или username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={fetchUsers}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <FaSync />
                Обновить
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Таблица пользователей */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h6 className="mb-0">Список пользователей ({filteredUsers.length})</h6>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <FaUsers size={64} className="mb-3" />
              <h5>Нет пользователей</h5>
              <p>По вашему запросу ничего не найдено</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Пользователь</th>
                  <th>Контакт</th>
                  <th>Регистрация</th>
                  <th>Бронирований</th>
                  <th>Потрачено</th>
                  <th>Статус</th>
                  <th>Роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="fw-bold">{user.full_name}</div>
                      <small className="text-muted">@{user.username}</small>
                    </td>
                    <td>
                      <div>{user.email}</div>
                      <small className="text-muted">{user.phone}</small>
                    </td>
                    <td>
                      {new Date(user.registration_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td>
                      <span className="fw-bold">{user.total_bookings || 0}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">{(user.total_spent || 0).toLocaleString()} ₽</span>
                    </td>
                    <td>{getStatusBadge(user.is_active)}</td>
                    <td>{getStaffBadge(user.is_staff)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => setShowDetails(user)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <FaEye />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={user.is_active !== false ? 'warning' : 'success'}
                          onClick={() => handleStatusChange(user.id, user.is_active !== false ? 'inactive' : 'active')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {user.is_active !== false ? <FaBan /> : <FaCheck />}
                        </Button>
                        {!user.is_staff && (
                          <Button 
                            size="sm" 
                            variant="outline-info"
                            onClick={() => handleStaffToggle(user.id, user.is_staff)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <FaStar />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Модальное окно деталей пользователя */}
      <Modal show={showDetails} onHide={() => setShowDetails(null)} size="lg">
        {showDetails && (
          <>
            <Modal.Header closeButton>
              <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaUser />
                Детали пользователя
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <h6 className="fw-bold mb-3">Основная информация</h6>
                  <p><strong>Имя:</strong> {showDetails.full_name}</p>
                  <p><strong>Username:</strong> @{showDetails.username}</p>
                  <p><strong>Email:</strong> {showDetails.email}</p>
                  <p><strong>Паспорт:</strong> {showDetails.profile?.passport_number || '-'}</p>
                  <p><strong>Дата регистрации:</strong> {new Date(showDetails.registration_date).toLocaleDateString('ru-RU')}</p>
                </Col>
                <Col md={6}>
                  <h6 className="fw-bold mb-3">Статистика</h6>
                  <p><strong>Всего бронирований:</strong> {showDetails.total_bookings || 0}</p>
                  <p><strong>Потрачено:</strong> {(showDetails.total_spent || 0).toLocaleString()} ₽</p>
                  <p><strong>Средний чек:</strong> {showDetails.total_bookings > 0 
                    ? (showDetails.total_spent / showDetails.total_bookings).toLocaleString() 
                    : 0} ₽</p>
                  <p><strong>Статус:</strong> {getStatusBadge(showDetails.is_active)}</p>
                  <p><strong>Роль:</strong> {getStaffBadge(showDetails.is_staff)}</p>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetails(null)}>
                Закрыть
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default AdminUsers;
