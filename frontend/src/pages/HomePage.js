import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import CityInput from '../components/CityInput';
import {
  FaBus,
  FaSearch,
  FaPercentage,
  FaGraduationCap,
  FaWheelchair,
  FaBaby,
  FaUserPlus
} from 'react-icons/fa';

function HomePage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination || !date) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    navigate(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`);
  };

  const discounts = [
    {
      icon: FaUserPlus,
      title: 'Пенсионеры',
      discount: '50%',
      description: 'При предъявлении пенсионного удостоверения',
      color: '#28a745'
    },
    {
      icon: FaGraduationCap,
      title: 'Студенты',
      discount: '30%',
      description: 'При предъявлении студенческого билета',
      color: '#17a2b8'
    },
    {
      icon: FaWheelchair,
      title: 'Инвалиды',
      discount: '50%',
      description: 'При предъявлении справки об инвалидности',
      color: '#6f42c1'
    },
    {
      icon: FaBaby,
      title: 'Дети до 7 лет',
      discount: 'Бесплатно',
      description: 'Без предоставления отдельного места',
      color: '#e83e8c'
    }
  ];

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={6}>
          <div className="text-center mb-5">
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center"
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#5D111A',
                borderRadius: '50%',
                color: 'white',
                fontSize: '3rem'
              }}
            >
              <FaBus />
            </div>
            <h1 className="mb-3" style={{ fontSize: '3rem', color: '#5D111A', fontWeight: '700' }}>
              Свой Рейс
            </h1>
            <p className="lead" style={{ fontSize: '1.4rem', color: '#5A5A5A' }}>
              Пассажирские перевозки в сельской местности
            </p>
          </div>

          <div
            className="p-4 shadow-lg"
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '4px solid #5D111A'
            }}
          >
            <h2 className="text-center mb-4" style={{ fontSize: '2rem', color: '#5D111A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <FaSearch />
              Поиск рейса
            </h2>

            <Form onSubmit={handleSubmit}>
              <CityInput
                id="origin"
                label="Откуда"
                placeholder="Введите город отправления"
                value={origin}
                onChange={setOrigin}
              />

              <CityInput
                id="destination"
                label="Куда"
                placeholder="Введите город назначения"
                value={destination}
                onChange={setDestination}
              />

              <Form.Group className="mb-4">
                <Form.Label
                  htmlFor="date"
                  style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a' }}
                >
                  Дата поездки
                </Form.Label>
                <Form.Control
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    fontSize: '1.2rem',
                    padding: '1rem',
                    border: '3px solid #dee2e6',
                    borderRadius: '12px',
                    minHeight: '60px'
                  }}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                style={{
                  backgroundColor: '#5D111A',
                  borderColor: '#5D111A',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  minHeight: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem'
                }}
              >
                <FaSearch />
                Найти рейсы
              </Button>
            </Form>
          </div>

          {/* Информационный блок о льготах */}
          <div className="mt-5">
            <h3
              className="text-center mb-4"
              style={{
                fontSize: '1.8rem',
                color: '#5D111A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
            >
              <FaPercentage />
              Льготные категории
            </h3>
            <Row>
              {discounts.map((discount, index) => {
                const IconComponent = discount.icon;
                return (
                  <Col xs={12} md={6} key={index} className="mb-3">
                    <Card
                      className="h-100 border-0 shadow-sm"
                      style={{
                        borderRadius: '16px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                      }}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start">
                          <div
                            className="me-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: `${discount.color}20`,
                              borderRadius: '12px',
                              color: discount.color,
                              fontSize: '1.8rem',
                              flexShrink: 0
                            }}
                          >
                            <IconComponent />
                          </div>
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <h5 className="mb-0" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                                {discount.title}
                              </h5>
                              <span
                                className="ms-2 px-2 py-1 rounded"
                                style={{
                                  backgroundColor: discount.color,
                                  color: 'white',
                                  fontSize: '1rem',
                                  fontWeight: '700'
                                }}
                              >
                                {discount.discount}
                              </span>
                            </div>
                            <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
                              {discount.description}
                            </p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
