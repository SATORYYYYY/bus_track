import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      await axios.post('http://localhost:8000/auth/users/', {
        username,
        password,
        re_password: password2,
        email,
      });
      setSuccess('Регистрация успешна! Теперь вы можете войти.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Ошибка регистрации. Возможно, имя пользователя занято.');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2>Регистрация</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Имя пользователя</Form.Label>
          <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Пароль</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Подтверждение пароля</Form.Label>
          <Form.Control type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
        </Form.Group>
        <Button variant="primary" type="submit">Зарегистрироваться</Button>
      </Form>
      <div className="mt-3">
        Уже есть аккаунт? <Link to="/login">Войдите</Link>
      </div>
    </Container>
  );
}

export default RegisterPage;