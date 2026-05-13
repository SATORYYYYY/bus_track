import { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FaBus, FaClock, FaMapMarkerAlt, FaChair, FaTag } from 'react-icons/fa';
import './SearchResults.css'; 

function SearchResults() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/buses/schedules/', {
          params: {
            origin: query.get('origin'),
            destination: query.get('destination'),
            date: query.get('date'),
          },
        });
        setSchedules(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [location, query]);

  if (loading) return (
    <Container className="mt-5 text-center">
      <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3 text-muted">Поиск подходящих рейсов...</p>
    </Container>
  );

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Найденные рейсы</h2>
      <p className="text-muted mb-4">
        {schedules.length} рейсов по направлению {query.get('origin')} → {query.get('destination')}
      </p>
      
      {schedules.length === 0 && (
        <div className="text-center py-5">
          <FaBus size={50} className="text-muted mb-3" />
          <h3>Нет рейсов по вашему запросу</h3>
          <p className="text-muted">Попробуйте изменить дату или направление</p>
          <Button as={Link} to="/" variant="primary">Вернуться к поиску</Button>
        </div>
      )}
      
      {schedules.map((schedule) => (
        <Card key={schedule.id} className="mb-4 schedule-card">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col lg={8}>
                <Row className="align-items-center">
                  <Col md={5}>
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-primary me-2" />
                      <h5 className="mb-0">{schedule.route.origin_name}</h5>
                    </div>
                    <div className="time-display">
                      <Badge bg="light" text="dark" className="p-3">
                        <FaClock className="me-2" />
                        {formatTime(schedule.departure_time)}
                      </Badge>
                    </div>
                  </Col>
                  
                  <Col md={2} className="text-center">
                    <div className="route-line">
                      <div className="line"></div>
                      <FaBus className="bus-icon" />
                      <div className="line"></div>
                    </div>
                  </Col>
                  
                  <Col md={5}>
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-danger me-2" />
                      <h5 className="mb-0">{schedule.route.destination_name}</h5>
                    </div>
                    <div className="time-display">
                      <Badge bg="light" text="dark" className="p-3">
                        <FaClock className="me-2" />
                        {formatTime(schedule.arrival_time)}
                      </Badge>
                    </div>
                  </Col>
                </Row>
                
                <hr className="my-3" />
                
                <Row className="text-muted">
                  <Col xs={6} md={3}>
                    <FaBus className="me-1" /> {schedule.bus.number}
                  </Col>
                  <Col xs={6} md={3}>
                    <FaChair className="me-1" /> {schedule.available_seats} мест
                  </Col>
                  <Col xs={12} md={6} className="mt-2 mt-md-0">
                    <small>{schedule.bus.amenities || 'Wi-Fi, кондиционер'}</small>
                  </Col>
                </Row>
              </Col>
              
              <Col lg={4} className="text-lg-end mt-4 mt-lg-0">
                <div className="price-tag mb-3">
                  <FaTag className="me-2" />
                  <span className="display-6 fw-bold">{schedule.price} ₽</span>
                </div>
                <Link to={`/booking/${schedule.id}`}>
                  <Button variant="primary" size="lg" className="px-5">
                    Выбрать место
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default SearchResults;