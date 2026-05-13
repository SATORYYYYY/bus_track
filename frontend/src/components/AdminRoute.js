import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Spinner } from 'react-bootstrap';

function AdminRoute({ children }) {
  const { isAdmin, user, loading } = useContext(AuthContext);

  // Пока идет загрузка, показываем спиннер
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" style={{ color: '#5D111A', width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (!user) {
    // Пользователь не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Пользователь не администратор, показываем сообщение об ошибке
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-danger mb-4">⛔ Доступ запрещен</h3>
                <p>У вас недостаточно прав для доступа к административной панели.</p>
                <p>Обратитесь к администратору системы для получения прав.</p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => window.history.back()}
                >
                  Вернуться назад
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Пользователь администратор, показываем содержимое
  return children;
}

export default AdminRoute;