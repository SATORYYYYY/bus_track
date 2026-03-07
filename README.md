# Проект: Веб-сайт для продажи билетов на междугородние автобусы

### 1. Клонирование репозитория
```bash
Открой заранее 2 терминала для бэка и для фронта

git clone <url-репозитория>
cd bus-ticket

2. Настройка бэкенда (Django)
Перейди в папку backend:

cd backend
2.1. Создание виртуального окружения и установка зависимостей

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

2.2. Применение миграций

cd bus_ticket
python manage.py makemigrations
python manage.py migrate

2.3. Загрузка тестовых данных (города и расписания)

python manage.py load_cities        
python manage.py fetch_schedules

2.4. Создание суперпользователя (для входа в админку)

python manage.py createsuperuser

2.5. Запуск сервера

python manage.py runserver
Админ-панель: http://127.0.0.1:8000/admin

3. Настройка фронтенда (React)
Открой новый терминал и перейди в папку frontend:

cd frontend
3.1. Установка зависимостей

npm install

3.2. Запуск приложения

npm start