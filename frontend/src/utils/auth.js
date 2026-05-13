import axios from 'axios';

// Проверка является ли пользователь администратором
export const isUserAdmin = async (token) => {
  if (!token) return false;
  
  try {
    const response = await axios.get('http://localhost:8000/api/users/me/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Проверяем наличие административных прав
    const user = response.data;
    return user.is_staff || user.is_superuser;
  } catch (error) {
    console.error('Ошибка проверки прав администратора:', error);
    return false;
  }
};

// Получение профиля пользователя с правами
export const getUserProfile = async (token) => {
  if (!token) return null;
  
  console.log('🔑 Токен для запроса:', token.substring(0, 20) + '...');
  
  try {
    // Сначала пробуем альтернативный endpoint /api/users/me/
    console.log('🔄 Пытаемся получить данные через /api/users/me/');
    const response = await axios.get('http://localhost:8000/api/users/me/', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Данные пользователя получены:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка получения профиля через /api/users/me/:', {
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Если токен недействителен (401), удаляем его
    if (error.response?.status === 401) {
      console.log('🔒 Токен недействителен, удаляем...');
      localStorage.removeItem('token');
      return null;
    }
    
    // Если основной endpoint недоступен, пробуем Djoser endpoint
    try {
      console.log('🔄 Пробуем Djoser endpoint /auth/users/me/...');
      const altResponse = await axios.get('http://localhost:8000/auth/users/me/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Данные пользователя получены (Djoser endpoint):', altResponse.data);
      return altResponse.data;
    } catch (altError) {
      console.error('❌ Все endpoints недоступны:', altError.response?.data || altError.message);
      // Если и здесь 401, тоже удаляем токен
      if (altError.response?.status === 401) {
        localStorage.removeItem('token');
      }
      return null;
    }
  }
};