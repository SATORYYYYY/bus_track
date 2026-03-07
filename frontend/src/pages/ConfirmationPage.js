import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button } from 'react-bootstrap';

function ConfirmationPage() {
  const { bookingCode } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/bookings/${bookingCode}/`)
      .then(response => setBooking(response.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingCode]);

  if (loading) return <Container>Загрузка...</Container>;
  if (!booking) return <Container>Бронь не найдена</Container>;

  return (
    <Container className="mt-5 text-center">
      <Card style={{ borderColor: '#9FB2AC' }}>
        <Card.Body>
          <Card.Title>Бронирование подтверждено!</Card.Title>
          <Card.Text>
            <strong>Код бронирования:</strong> {booking.booking_code}<br />
            <strong>Пассажир:</strong> {booking.passenger_name}<br />
            <strong>Рейс:</strong> {booking.schedule.route.origin_name} → {booking.schedule.route.destination_name}<br />
            <strong>Дата и время:</strong> {new Date(booking.schedule.departure_time).toLocaleString()}<br />
            <strong>Место:</strong> {booking.seat_number}<br />
            <strong>Багаж:</strong> {booking.has_luggage ? 'Да' : 'Нет'}
          </Card.Text>
          <Link to="/">
            <Button variant="primary">На главную</Button>
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ConfirmationPage;