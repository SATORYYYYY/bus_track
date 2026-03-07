import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [profileData, setProfileData] = useState({
    full_name: '',
    birth_date: '',
    passport_number: '',
    has_luggage: false,
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      axios.get('http://localhost:8000/api/bookings/my/')
        .then(response => setBookings(response.data))
        .catch(console.error);
      if (user.profile) {
        setProfileData(user.profile);
      }
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const saveProfile = async () => {
    try {
      await axios.patch('http://localhost:8000/api/users/me/', { profile: profileData });
      setEditing(false);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Личный кабинет</h2>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Профиль</Card.Title>
          {editing ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>ФИО</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Дата рождения</Form.Label>
                <Form.Control
                  type="date"
                  name="birth_date"
                  value={profileData.birth_date}
                  onChange={handleProfileChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Паспорт</Form.Label>
                <Form.Control
                  type="text"
                  name="passport_number"
                  value={profileData.passport_number}
                  onChange={handleProfileChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Багаж по умолчанию"
                  name="has_luggage"
                  checked={profileData.has_luggage}
                  onChange={handleProfileChange}
                />
              </Form.Group>
              <Button variant="primary" onClick={saveProfile}>Сохранить</Button>{' '}
              <Button variant="secondary" onClick={() => setEditing(false)}>Отмена</Button>
            </>
          ) : (
            <>
              <p><strong>ФИО:</strong> {user?.profile?.full_name || 'не указано'}</p>
              <p><strong>Дата рождения:</strong> {user?.profile?.birth_date || 'не указано'}</p>
              <p><strong>Паспорт:</strong> {user?.profile?.passport_number || 'не указано'}</p>
              <p><strong>Багаж:</strong> {user?.profile?.has_luggage ? 'Да' : 'Нет'}</p>
              <Button variant="outline-accent" onClick={() => setEditing(true)}>Редактировать</Button>
            </>
          )}
        </Card.Body>
      </Card>

      <h3>Мои бронирования</h3>
      {bookings.length === 0 && <p>У вас пока нет бронирований.</p>}
      {bookings.map(booking => (
        <Card key={booking.id} className="mb-3">
          <Card.Body>
            <Card.Title>{booking.schedule.route.origin_name} → {booking.schedule.route.destination_name}</Card.Title>
            <Card.Text>
              Дата: {new Date(booking.schedule.departure_time).toLocaleDateString()}<br />
              Место: {booking.seat_number}<br />
              Статус: {booking.status}<br />
              Код: {booking.booking_code}
            </Card.Text>
            <Button variant="outline-primary" size="sm" href={`/confirmation/${booking.booking_code}`}>
              Детали
            </Button>
          </Card.Body>
        </Card>
      ))}
      <Button variant="danger" onClick={handleLogout}>Выйти</Button>
    </Container>
  );
}

export default ProfilePage;