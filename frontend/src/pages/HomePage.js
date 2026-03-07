import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import CityInput from '../components/CityInput';

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

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-5">
            <h1 className="display-4 mb-3">Поиск автобусных билетов</h1>
            <p className="lead text-muted">Путешествуйте с комфортом по доступным ценам</p>
          </div>
          
          <div className="search-card p-4 rounded-4 shadow-lg" style={{ backgroundColor: 'white' }}>
            <Form onSubmit={handleSubmit}>
              <CityInput
                id="origin"
                label="Откуда"
                placeholder="Город отправления"
                value={origin}
                onChange={setOrigin}
              />
              
              <CityInput
                id="destination"
                label="Куда"
                placeholder="Город назначения"
                value={destination}
                onChange={setDestination}
              />
              
              <Form.Group className="mb-4">
                <Form.Label htmlFor="date">Дата</Form.Label>
                <Form.Control
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control-lg"
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-3 fw-bold"
                style={{ 
                  backgroundColor: '#5D111A', 
                  borderColor: '#5D111A',
                  fontSize: '1.2rem'
                }}
              >
                Найти билеты
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;