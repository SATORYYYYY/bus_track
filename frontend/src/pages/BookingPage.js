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
    discount_type: 'none',
  });
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`http://localhost:8000/api/buses/schedules/${scheduleId}/`, { headers });
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
      // Автоматическое определение льготы по возрасту
      let autoDiscount = 'none';
      if (age >= 60) autoDiscount = 'pensioner';
      else if (age <= 7) autoDiscount = 'child';

      setFormData({
        passenger_name: profile.full_name || '',
        passenger_age: age,
        passenger_email: user.email || '',
        passport_number: profile.passport_number || '',
        has_luggage: profile.has_luggage || false,
        discount_type: autoDiscount,
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

  if (loading) return <Container className="mt-5"><h2>Загрузка...</h2></Container>;
  if (error && !schedule) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4" style={{ fontSize: '2.2rem' }}>Бронирование билета</h2>
      <Card className="mb-4 shadow" style={{ borderRadius: '16px', border: '3px solid #5D111A' }}>
        <Card.Body className="p-4">
          <Card.Title style={{ fontSize: '1.5rem', color: '#5D111A' }}>
            {schedule.route.origin_name} → {schedule.route.destination_name}
          </Card.Title>
          <Card.Text style={{ fontSize: '1.2rem' }}>
            <strong>Отправление:</strong> {new Date(schedule.departure_time).toLocaleString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })})}<br />
            <strong>Автобус:</strong> {schedule.bus.number}<br />
            <strong>Базовая цена:</strong> {schedule.price} руб.
          </Card.Text>
        </Card.Body>
      </Card>

      {user && user.profile && (
        <Button
          variant="outline-primary"
          onClick={fillProfileData}
          className="mb-4 w-100"
          style={{ fontSize: '1.2rem', padding: '1rem', borderWidth: '3px' }}
        >
          Заполнить данными из профиля
        </Button>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600' }}>ФИО пассажира</Form.Label>
          <Form.Control
            type="text"
            name="passenger_name"
            value={formData.passenger_name}
            onChange={handleChange}
            required
            style={{ fontSize: '1.1rem', padding: '0.75rem' }}
            placeholder="Введите полное имя"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600' }}>Возраст</Form.Label>
          <Form.Control
            type="number"
            name="passenger_age"
            value={formData.passenger_age}
            onChange={handleChange}
            required
            min="0"
            max="120"
            style={{ fontSize: '1.1rem', padding: '0.75rem' }}
            placeholder="Введите возраст"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600' }}>Email</Form.Label>
          <Form.Control
            type="email"
            name="passenger_email"
            value={formData.passenger_email}
            onChange={handleChange}
            required
            style={{ fontSize: '1.1rem', padding: '0.75rem' }}
            placeholder="email@example.com"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600' }}>Номер паспорта</Form.Label>
          <Form.Control
            type="text"
            name="passport_number"
            value={formData.passport_number}
            onChange={handleChange}
            required
            style={{ fontSize: '1.1rem', padding: '0.75rem' }}
            placeholder="0000 000000"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Есть багаж"
            name="has_luggage"
            checked={formData.has_luggage}
            onChange={handleChange}
            style={{ fontSize: '1.1rem' }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600' }}>Льготная категория</Form.Label>
          <Form.Select
            name="discount_type"
            value={formData.discount_type}
            onChange={handleChange}
            style={{ fontSize: '1.1rem', padding: '0.75rem' }}
          >
            <option value="none">Без льготы</option>
            <option value="pensioner">Пенсионер (50%)</option>
            <option value="student">Студент (30%)</option>
            <option value="disabled">Инвалид (50%)</option>
            <option value="child">Ребенок до 7 лет (бесплатно)</option>
          </Form.Select>
          {formData.discount_type !== 'none' && schedule && (
            <Form.Text className="text-success" style={{ fontSize: '1rem' }}>
              <strong>Скидка применена: {formData.discount_type === 'child' ? '100%' : formData.discount_type === 'pensioner' || formData.discount_type === 'disabled' ? '50%' : '30%'}</strong>
              <br />
              Итоговая цена: <strong>{(schedule.price * (formData.discount_type === 'child' ? 0 : formData.discount_type === 'pensioner' || formData.discount_type === 'disabled' ? 0.5 : 0.7)).toFixed(0)} руб.</strong>
              {formData.discount_type !== 'child' && <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '10px' }}>{schedule.price} руб.</span>}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600' }}>Выберите место</Form.Label>
          <SeatMap
            totalSeats={schedule.bus.total_seats}
            bookedSeats={schedule.booked_seats || []}
            selectedSeat={selectedSeat}
            onSelect={setSelectedSeat}
          />
        </Form.Group>
        {error && <Alert variant="danger" style={{ fontSize: '1.1rem' }}>{error}</Alert>}
        <Button
          variant="primary"
          type="submit"
          className="w-100"
          style={{ fontSize: '1.3rem', padding: '1rem', marginTop: '1rem' }}
        >
          Забронировать билет
        </Button>
      </Form>
    </Container>
  );
}

export default BookingPage;