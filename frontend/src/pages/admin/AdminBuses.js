import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaBus, FaPlus, FaWrench, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api';

function AdminBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    model: '',
    year: new Date().getFullYear(),
    seats: 48,
    facilities: []
  });

  const facilitiesOptions = ['WiFi', 'Кондиционер', 'Туалет', 'Розетки', 'USB зарядки', 'ТВ', 'Кулер'];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/buses/`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Ошибка загрузки автобусов');
      const data = await response.json();
      setBuses(data.map(bus => ({
        id: bus.id,
        number: bus.number,
        model: bus.model,
        year: new Date().getFullYear(),
        seats: bus.total_seats,
        facilities: bus.amenities ? bus.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        status: 'active',
        lastMaintenance: new Date().toISOString().split('T')[0]
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const busData = {
        number: formData.number,
        model: formData.model,
        total_seats: formData.seats,
        amenities: formData.facilities.join(', ')
      };

      const response = await fetch(`${API_URL}/buses/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(busData)
      });

      if (!response.ok) throw new Error('Ошибка создания автобуса');
      
      await fetchBuses();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditBus = async (e) => {
    e.preventDefault();
    try {
      const busData = {
        number: formData.number,
        model: formData.model,
        total_seats: formData.seats,
        amenities: formData.facilities.join(', ')
      };

      const response = await fetch(`${API_URL}/buses/${editingBus.id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(busData)
      });

      if (!response.ok) throw new Error('Ошибка обновления автобуса');
      
      await fetchBuses();
      setShowModal(false);
      setEditingBus(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот автобус?')) return;
    
    try {
      const response = await fetch(`${API_URL}/buses/${busId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Ошибка удаления автобуса');
      
      await fetchBuses();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setFormData({
      number: bus.number,
      model: bus.model,
      year: bus.year,
      seats: bus.seats,
      facilities: bus.facilities
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingBus(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      number: '',
      model: '',
      year: new Date().getFullYear(),
      seats: 48,
      facilities: []
    });
  };

  const toggleFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleStatusChange = (busId, newStatus) => {
    setBuses(prev => prev.map(bus => 
      bus.id === busId ? { ...bus, status: newStatus } : bus
    ));
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      maintenance: 'warning',
      inactive: 'secondary'
    };
    const labels = {
      active: 'В работе',
      maintenance: 'На ТО',
      inactive: 'Неактивен'
    };
    return <Badge bg={variants[status]}>{labels[status]}</Badge>;
  };

  const activeBuses = buses.filter(bus => bus.status === 'active').length;
  const totalSeats = buses.reduce((sum, bus) => sum + bus.seats, 0);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: '#5D111A' }} />
        <p className="mt-3">Загрузка автобусов...</p>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 style={{ color: '#5D111A' }}>
              <FaBus className="me-2" />
              Управление автобусами
            </h4>
            <Button variant="primary" onClick={openAddModal} style={{ fontSize: '1.1rem', padding: '10px 20px' }}>
              <FaPlus className="me-2" />
              Добавить автобус
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1" style={{ color: '#5D111A' }}>{buses.length}</h3>
              <small className="text-muted">Всего автобусов</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h3 className="text-success mb-1">{activeBuses}</h3>
              <small className="text-muted">В работе</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h3 className="text-warning mb-1">{buses.filter(b => b.status === 'maintenance').length}</h3>
              <small className="text-muted">На ТО</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h3 className="text-info mb-1">{totalSeats}</h3>
              <small className="text-muted">Всего мест</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Список автобусов</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0" style={{ fontSize: '1.1rem' }}>
            <thead className="bg-light">
              <tr>
                <th>Номер</th>
                <th>Модель</th>
                <th>Места</th>
                <th>Удобства</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {buses.map(bus => (
                <tr key={bus.id}>
                  <td className="fw-bold">{bus.number}</td>
                  <td>{bus.model}</td>
                  <td>{bus.seats}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {bus.facilities.map(facility => (
                        <Badge key={facility} bg="light" text="dark" className="small">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>{getStatusBadge(bus.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {bus.status === 'active' ? (
                        <Button 
                          size="sm" 
                          variant="warning"
                          onClick={() => handleStatusChange(bus.id, 'maintenance')}
                          title="На техническое обслуживание"
                        >
                          <FaWrench />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleStatusChange(bus.id, 'active')}
                          title="Вернуть в работу"
                        >
                          <FaCheck />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => openEditModal(bus)}
                        title="Редактировать"
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => handleDeleteBus(bus.id)}
                        title="Удалить"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Нет автобусов. Добавьте первый автобус.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={editingBus ? handleEditBus : handleAddBus}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '1.4rem' }}>
              {editingBus ? (
                <><FaEdit className="me-2" />Редактировать автобус</>
              ) : (
                <><FaPlus className="me-2" />Добавить новый автобус</>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 500 }}>Номер автобуса</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="А123КХ"
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    required
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 500 }}>Модель</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Mercedes-Benz Travego"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 500 }}>Количество мест</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                    required
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 500 }}>Удобства в автобусе</Form.Label>
                  <div className="d-flex flex-wrap gap-3">
                    {facilitiesOptions.map(facility => (
                      <Form.Check
                        key={facility}
                        type="checkbox"
                        label={facility}
                        checked={formData.facilities.includes(facility)}
                        onChange={() => toggleFacility(facility)}
                        style={{ fontSize: '1.1rem' }}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} style={{ fontSize: '1.1rem', padding: '10px 20px' }}>
              Отмена
            </Button>
            <Button variant="primary" type="submit" style={{ fontSize: '1.1rem', padding: '10px 20px' }}>
              {editingBus ? 'Сохранить изменения' : 'Добавить автобус'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminBuses;
