import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBus, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaClock, FaRoute } from 'react-icons/fa';

function AdminSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [cities, setCities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    origin_city: '',
    destination_city: '',
    bus: '',
    departure_time: '',
    arrival_time: '',
    price: '',
  });

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [schedulesRes, busesRes, citiesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/buses/schedules/', { headers }),
        axios.get('http://localhost:8000/api/buses/', { headers }),
        axios.get('http://localhost:8000/api/buses/cities/autocomplete/?q=', { headers }),
      ]);

      setSchedules(schedulesRes.data || []);
      setBuses(busesRes.data || []);
      setCities(citiesRes.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (schedule) => {
    const bookedSeats = schedule.booked_seats?.length || 0;
    const totalSeats = schedule.bus?.total_seats || 0;
    const isFull = bookedSeats >= totalSeats;
    
    if (isFull) return <Badge bg="danger">Заполнен</Badge>;
    return <Badge bg="success">Активен</Badge>;
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      // Сначала создаем маршрут если его нет
      const routeData = {
        origin: parseInt(formData.origin_city),
        destination: parseInt(formData.destination_city),
        distance_km: 0
      };

      // Создаем расписание
      const scheduleData = {
        bus: parseInt(formData.bus),
        route: routeData,
        departure_time: formData.departure_time,
        arrival_time: formData.arrival_time,
        price: parseFloat(formData.price),
        available_seats: buses.find(b => b.id === parseInt(formData.bus))?.total_seats || 50
      };

      await axios.post('http://localhost:8000/api/buses/schedules/create/', scheduleData, { headers });
      
      setShowModal(false);
      setFormData({
        origin_city: '',
        destination_city: '',
        bus: '',
        departure_time: '',
        arrival_time: '',
        price: '',
      });
      fetchData();
    } catch (err) {
      console.error('Ошибка создания рейса:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.detail || err.response?.data?.route?.[0] || 'Ошибка при создании рейса');
    }
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        bus: parseInt(formData.bus),
        departure_time: formData.departure_time,
        arrival_time: formData.arrival_time,
        price: parseFloat(formData.price),
      };

      await axios.patch(`http://localhost:8000/api/buses/schedules/${editingSchedule.id}/`, scheduleData, { headers });
      
      setShowEditModal(false);
      setEditingSchedule(null);
      fetchData();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError('Ошибка при обновлении рейса');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот рейс?')) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/buses/schedules/${scheduleId}/`, { headers });
      fetchData();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError('Ошибка при удалении рейса');
    }
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      origin_city: schedule.route?.origin?.id || '',
      destination_city: schedule.route?.destination?.id || '',
      bus: schedule.bus?.id || '',
      departure_time: schedule.departure_time ? new Date(schedule.departure_time).toISOString().slice(0, 16) : '',
      arrival_time: schedule.arrival_time ? new Date(schedule.arrival_time).toISOString().slice(0, 16) : '',
      price: schedule.price || '',
    });
    setShowEditModal(true);
  };

  const totalSeats = schedules.reduce((sum, s) => sum + (s.bus?.total_seats || 0), 0);
  const bookedSeats = schedules.reduce((sum, s) => sum + (s.booked_seats?.length || 0), 0);

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 style={{ color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCalendarAlt /> Управление расписанием
            </h4>
            <Button variant="primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPlus /> Добавить рейс
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-primary mb-1">{schedules.length}</h5>
              <small className="text-muted">Всего рейсов</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-success mb-1">{buses.length}</h5>
              <small className="text-muted">Автобусов</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-info mb-1">{bookedSeats}/{totalSeats}</h5>
              <small className="text-muted">Занято мест</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="text-success mb-1">
                {totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0}%
              </h5>
              <small className="text-muted">Заполняемость</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Таблица расписания */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h6 className="mb-0">Расписание рейсов</h6>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <FaCalendarAlt size={64} className="mb-3" />
              <h5>Нет рейсов</h5>
              <p>Добавьте первый рейс в расписание</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Маршрут</th>
                  <th>Автобус</th>
                  <th>Отправление</th>
                  <th>Прибытие</th>
                  <th>Цена</th>
                  <th>Места</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.id}>
                    <td className="fw-bold">
                      {schedule.route?.origin_name} → {schedule.route?.destination_name}
                    </td>
                    <td>{schedule.bus?.number}</td>
                    <td>
                      <div>{new Date(schedule.departure_time).toLocaleDateString('ru-RU')}</div>
                      <small className="text-muted">
                        {new Date(schedule.departure_time).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                      </small>
                    </td>
                    <td>
                      <div>{new Date(schedule.arrival_time).toLocaleDateString('ru-RU')}</div>
                      <small className="text-muted">
                        {new Date(schedule.arrival_time).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                      </small>
                    </td>
                    <td>{parseFloat(schedule.price).toLocaleString()} ₽</td>
                    <td>
                      <div>{schedule.available_seats}/{schedule.bus?.total_seats}</div>
                      <div className="progress" style={{height: '4px'}}>
                        <div 
                          className={`progress-bar ${
                            (schedule.booked_seats?.length || 0) / (schedule.bus?.total_seats || 1) > 0.7 ? 'bg-danger' : 'bg-success'
                          }`}
                          style={{width: `${((schedule.booked_seats?.length || 0) / (schedule.bus?.total_seats || 1)) * 100}%`}}
                        ></div>
                      </div>
                    </td>
                    <td>{getStatusBadge(schedule)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => openEditModal(schedule)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Модальное окно создания рейса */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={handleCreateSchedule}>
          <Modal.Header closeButton>
            <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPlus /> Добавить новый рейс
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Город отправления</Form.Label>
                  <Form.Select
                    value={formData.origin_city}
                    onChange={(e) => setFormData({...formData, origin_city: e.target.value})}
                    required
                  >
                    <option value="">Выберите город</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Город прибытия</Form.Label>
                  <Form.Select
                    value={formData.destination_city}
                    onChange={(e) => setFormData({...formData, destination_city: e.target.value})}
                    required
                  >
                    <option value="">Выберите город</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Автобус</Form.Label>
                  <Form.Select
                    value={formData.bus}
                    onChange={(e) => setFormData({...formData, bus: e.target.value})}
                    required
                  >
                    <option value="">Выберите автобус</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>{bus.number} - {bus.model} ({bus.total_seats} мест)</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Цена (руб.)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="2400"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата и время отправления</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата и время прибытия</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Создать рейс
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Модальное окно редактирования */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Form onSubmit={handleUpdateSchedule}>
          <Modal.Header closeButton>
            <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaEdit /> Редактировать рейс
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Автобус</Form.Label>
                  <Form.Select
                    value={formData.bus}
                    onChange={(e) => setFormData({...formData, bus: e.target.value})}
                    required
                  >
                    <option value="">Выберите автобус</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>{bus.number} - {bus.model} ({bus.total_seats} мест)</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Цена (руб.)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="2400"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата и время отправления</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.departure_time}
                    onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата и время прибытия</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить изменения
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminSchedules;
