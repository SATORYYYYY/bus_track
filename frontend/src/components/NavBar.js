import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" style={{ backgroundColor: 'white' }} className="shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold" style={{ color: '#5D111A' }}>
          🚌 BusTicket
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="mx-2">Поиск</Nav.Link>
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile" className="mx-2">
                  👤 {user.username}
                </Nav.Link>
                <Button variant="outline-primary" onClick={handleLogout} className="ms-2">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="mx-2">Вход</Nav.Link>
                <Nav.Link as={Link} to="/register" className="mx-2">
                  <Button variant="primary" size="sm">Регистрация</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;