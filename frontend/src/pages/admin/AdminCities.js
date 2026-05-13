import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaCity, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/buses';

function AdminCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    population: ''
  });

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cities/`, { headers });
      setCities(response.data || []);
    } catch (err) {
      setError('Ошибка загрузки городов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      const cityData = {
        name: formData.name,
        region: formData.region,
        population: formData.population ? parseInt(formData.population) : null
      };

      await axios.post(`${API_URL}/cities/`, cityData, { headers });
      
      await fetchCities();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Ошибка создания города');
    }
  };

  const handleEditCity = async (e) => {
    e.preventDefault();
    try {
      const cityData = {
        name: formData.name,
        region: formData.region,
        population: formData.population ? parseInt(formData.population) : null
      };

      await axios.put(`${API_URL}/cities/${editingCity.id}/`, cityData, { headers });
      
      await fetchCities();
      setShowModal(false);
      setEditingCity(null);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Ошибка обновления города');
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот город?')) return;
    
    try {
      await axios.delete(`${API_URL}/cities/${cityId}/`, { headers });
      await fetchCities();
    } catch (err) {
      setError('Ошибка удаления города. Возможно, город используется в маршрутах.');
    }
  };

  const openEditModal = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      region: city.region || '',
      population: city.population || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingCity(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      population: ''
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: '#5D111A' }} />
        <p className="mt-3">Загрузка городов...</p>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 style={{ color: '#5D111A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCity /> Управление городами
            </h4>
            <Button 
              variant="primary" 
              onClick={openAddModal} 
              style={{ fontSize: '1.1rem', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPlus /> Добавить город
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={4} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1" style={{ color: '#5D111A' }}>{cities.length}</h3>
              <small className="text-muted">Всего городов</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h3 className="text-success mb-1">
                {cities.filter(c => c.is_active !== false).length}
              </h3>
              <small className="text-muted">Активных</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h3 className="text-info mb-1">
                {cities.filter(c => c.region).length}
              </h3>
              <small className="text-muted">С указанным регионом</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Таблица городов */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Список городов</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0" style={{ fontSize: '1.1rem' }}>
            <thead className="bg-light">
              <tr>
                <th>Название</th>
                <th>Регион</th>
                <th>Население</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {cities.map(city => (
                <tr key={city.id}>
                  <td className="fw-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaMapMarkerAlt className="text-primary" />
                    {city.name}
                  </td>
                  <td>{city.region || '-'}</td>
                  <td>{city.population ? city.population.toLocaleString() : '-'}</td>
                  <td>
                    <Badge bg={city.is_active !== false ? 'success' : 'secondary'}>
                      {city.is_active !== false ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => openEditModal(city)}
                        title="Редактировать"
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => handleDeleteCity(city.id)}
                        title="Удалить"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {cities.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    <FaCity size={48} className="mb-3" />
                    <p>Нет городов. Добавьте первый город.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Модальное окно добавления/редактирования города */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={editingCity ? handleEditCity : handleAddCity}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {editingCity ? <><FaEdit /> Редактировать город</> : <><FaPlus /> Добавить новый город</>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Название города *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Например: Москва"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Регион
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Например: Московская область"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Население
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Например: 12000000"
                    value={formData.population}
                    onChange={(e) => setFormData({...formData, population: e.target.value})}
                    min="0"
                    style={{ fontSize: '1.1rem', padding: '12px' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} style={{ fontSize: '1.1rem', padding: '10px 20px' }}>
              Отмена
            </Button>
            <Button variant="primary" type="submit" style={{ fontSize: '1.1rem', padding: '10px 20px' }}>
              {editingCity ? 'Сохранить изменения' : 'Добавить город'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminCities;
