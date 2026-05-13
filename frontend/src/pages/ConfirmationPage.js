import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

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

  if (loading) return <Container className="mt-5"><h2>Загрузка...</h2></Container>;
  if (!booking) return <Container className="mt-5"><h2>Бронь не найдена</h2></Container>;

  // Формируем данные для QR-кода
  const qrData = JSON.stringify({
    code: booking.booking_code,
    route: `${booking.schedule.route.origin_name} → ${booking.schedule.route.destination_name}`,
    date: new Date(booking.schedule.departure_time).toLocaleString(),
    seat: booking.seat_number,
    passenger: booking.passenger_name,
  });

  const discountLabels = {
    'none': 'Без льготы',
    'pensioner': 'Пенсионер',
    'student': 'Студент',
    'disabled': 'Инвалид',
    'child': 'Ребенок до 7 лет',
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-lg" style={{ borderRadius: '24px', border: '4px solid #5D111A' }}>
            <Card.Body className="p-4">
              <Card.Title style={{ fontSize: '2rem', color: '#5D111A', marginBottom: '1.5rem' }}>
                Бронирование подтверждено!
              </Card.Title>

              {/* QR-код */}
              <div className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '16px', display: 'inline-block' }}>
                <QRCodeSVG
                  value={qrData}
                  size={200}
                  level="H"
                  includeMargin={true}
                  style={{ display: 'block' }}
                />
                <p className="mt-2 mb-0" style={{ fontSize: '0.9rem', color: '#666' }}>
                  Покажите QR-код водителю
                </p>
              </div>

              <Card.Text style={{ fontSize: '1.2rem', lineHeight: '2' }}>
                <div className="mb-2">
                  <strong style={{ color: '#5D111A' }}>Код бронирования:</strong><br />
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '3px' }}>
                    {booking.booking_code}
                  </span>
                </div>

                <div className="mb-2">
                  <strong>Пассажир:</strong> {booking.passenger_name}
                </div>

                <div className="mb-2">
                  <strong>Рейс:</strong><br />
                  {booking.schedule.route.origin_name} → {booking.schedule.route.destination_name}
                </div>

                <div className="mb-2">
                  <strong>Дата и время отправления:</strong><br />
                  {new Date(booking.schedule.departure_time).toLocaleString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <div className="mb-2">
                  <strong>Место:</strong>{' '}
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5D111A' }}>
                    {booking.seat_number}
                  </span>
                </div>

                <div className="mb-2">
                  <strong>Багаж:</strong> {booking.has_luggage ? '✓ Есть' : '✗ Нет'}
                </div>

                {booking.discount_type && booking.discount_type !== 'none' && (
                  <div className="mb-2 p-2" style={{ backgroundColor: '#d4edda', borderRadius: '8px' }}>
                    <strong>Льгота:</strong> {discountLabels[booking.discount_type] || booking.discount_type}<br />
                    <strong>Скидка:</strong> {booking.discount_percent}%}%<br />
                    <strong>Итоговая цена:</strong>{' '}
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#155724' }}>
                      {booking.final_price} руб.
                    </span>
                    {booking.schedule.price !== booking.final_price && (
                      <span style={{ textDecoration: 'line-through', color: '#666', marginLeft: '10px' }}>
                        {booking.schedule.price} руб.
                      </span>
                    )}
                  </div>
                )}
              </Card.Text>

              <div className="d-grid gap-2 mt-4">
                <Link to="/">
                  <Button variant="primary" size="lg" className="w-100" style={{ fontSize: '1.3rem', padding: '1rem' }}>
                    На главную
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ConfirmationPage;