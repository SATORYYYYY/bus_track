import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import SeatMap from '../components/SeatMap';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function BookingPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_age: '',
    passenger_email: '',
    passport_number: '',
    has_luggage: false,
  });
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/buses/schedules/${scheduleId}/`);
        setSchedule(response.data);
      } catch (error) {
        setError('Не удалось загрузить данные рейса');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [scheduleId]);

  const fillProfileData = () => {
    if (user && user.profile) {
      const profile = user.profile;
      let age = '';
      if (profile.birth_date) {
        const birth = new Date(profile.birth_date);
        const today = new Date();
        age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      }
      setFormData({
        passenger_name: profile.full_name || '',
        passenger_age: age,
        passenger_email: user.email || '',
        passport_number: profile.passport_number || '',
        has_luggage: profile.has_luggage || false,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeat) {
      setError('Выберите место');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/bookings/create/', {
        schedule: scheduleId,
        seat_number: selectedSeat,
        ...formData,
      });
      navigate(`/confirmation/${response.data.booking_code}`);
    } catch (error) {
      setError('Ошибка при бронировании. Возможно, место уже занято.');
    }
  };

  if (loading) return <Container>Загрузка...</Container>;
  if (error && !schedule) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-4">
      <h2>Бронирование билета</h2>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{schedule.route.origin_name} → {schedule.route.destination_name}</Card.Title>
          <Card.Text>
            Отправление: {new Date(schedule.departure_time).toLocaleString()}<br />
            Автобус: {schedule.bus.number}<br />
            Цена: {schedule.price} руб.
          </Card.Text>
        </Card.Body>
      </Card>

      {user && user.profile && (
        <Button variant="outline-accent" onClick={fillProfileData} className="mb-3">
          Заполнить данными профиля
        </Button>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>ФИО пассажира</Form.Label>
          <Form.Control
            type="text"
            name="passenger_name"
            value={formData.passenger_name}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Возраст</Form.Label>
          <Form.Control
            type="number"
            name="passenger_age"
            value={formData.passenger_age}
            onChange={handleChange}
            required
            min="0"
            max="120"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="passenger_email"
            value={formData.passenger_email}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Номер паспорта</Form.Label>
          <Form.Control
            type="text"
            name="passport_number"
            value={formData.passport_number}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Есть багаж"
            name="has_luggage"
            checked={formData.has_luggage}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Выберите место</Form.Label>
          <SeatMap
            totalSeats={schedule.bus.total_seats}
            bookedSeats={schedule.booked_seats || []}
            selectedSeat={selectedSeat}
            onSelect={setSelectedSeat}
          />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button variant="primary" type="submit">
          Забронировать
        </Button>
      </Form>
    </Container>
  );
}

export default BookingPage;