import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { FaBus, FaHome, FaUser, FaTools, FaSignOutAlt } from 'react-icons/fa';

function NavBar() {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <Navbar expand="lg" style={{ backgroundColor: 'white', borderBottom: '3px solid #5D111A' }} className="py-3">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            color: '#5D111A',
            fontSize: '1.8rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaBus size={32} />
          Свой Рейс
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ fontSize: '1.5rem' }} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              className="mx-2"
              style={{ fontSize: '1.2rem', fontWeight: '600', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaHome />
              Главная
            </Nav.Link>
            {user ? (
              <>
                {isAdmin && (
                  <Nav.Item className="mx-2">
                    <Button
                      variant="outline-primary"
                      onClick={goToAdminPanel}
                      style={{
                        borderColor: '#5D111A',
                        color: '#5D111A',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        padding: '0.5rem 1rem',
                        borderWidth: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaTools />
                      Админ-панель
                    </Button>
                  </Nav.Item>
                )}
                <Nav.Link
                  as={Link}
                  to="/profile"
                  className="mx-2"
                  style={{ fontSize: '1.2rem', fontWeight: '600', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaUser />
                  {user.username}
                </Nav.Link>
                <Button
                  variant="primary"
                  onClick={handleLogout}
                  className="ms-2"
                  style={{
                    backgroundColor: '#5D111A',
                    borderColor: '#5D111A',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    padding: '0.5rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FaSignOutAlt />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="mx-2"
                  style={{ fontSize: '1.2rem', fontWeight: '600', padding: '0.75rem 1rem' }}
                >
                  Вход
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="mx-2">
                  <Button
                    variant="primary"
                    style={{
                      backgroundColor: '#5D111A',
                      borderColor: '#5D111A',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      padding: '0.5rem 1.5rem'
                    }}
                  >
                    Регистрация
                  </Button>
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
