# Deployment Guide for Ubuntu Server

Пошаговая инструкция по развёртыванию проекта Mobile Coffee на сервере Ubuntu.

## Требования

- Сервер Ubuntu 20.04+ (рекомендуется 22.04 LTS)
- Минимум 1 GB RAM
- 10 GB свободного места на диске
- Доменное имя (опционально, для production)

---

## Шаг 1: Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Шаг 2: Установка Docker

```bash
# Установка необходимых пакетов
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавление GPG-ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Проверка установки
docker --version
```

---

## Шаг 3: Установка Docker Compose

```bash
# Установка Docker Compose Plugin
sudo apt install -y docker-compose-plugin

# Проверка установки
docker compose version
```

---

## Шаг 4: Настройка прав для пользователя

```bash
# Добавление текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Применение изменений (выйдите и войдите снова, или выполните)
newgrp docker

# Проверка
docker ps
```

---

## Шаг 5: Загрузка проекта на сервер

### Вариант A: Через Git (рекомендуется)

```bash
# Клонирование репозитория
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> /opt/mobile_coffee
cd /opt/mobile_coffee
```

### Вариант B: Через SCP

```bash
# На локальной машине
scp -r mobile_coffee user@your-server:/opt/
```

### Вариант C: Через ZIP-архив

```bash
# Загрузите архив и распакуйте
sudo mkdir -p /opt/mobile_coffee
sudo unzip mobile_coffee.zip -d /opt/mobile_coffee
cd /opt/mobile_coffee
```

---

## Шаг 6: Настройка Docker Compose

### Для production обновите `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: mobile_coffee_backend
    restart: always
    volumes:
      - backend_data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./data/coffee_shop.db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - mobile_coffee_network

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: mobile_coffee_frontend
    restart: always
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - mobile_coffee_network

volumes:
  backend_data:
    driver: local

networks:
  mobile_coffee_network:
    driver: bridge
```

**Изменения для production:**
- `restart: always` вместо `unless-stopped`
- Убраны порты (будет использоваться reverse proxy)

---

## Шаг 7: Установка и настройка Nginx (Reverse Proxy)

```bash
# Установка Nginx
sudo apt install -y nginx

# Создание конфигурации
sudo nano /etc/nginx/sites-available/mobile_coffee
```

### Конфигурация Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Documentation
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Активация конфигурации:

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/mobile_coffee /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Шаг 8: Запуск проекта

```bash
cd /opt/mobile_coffee

# Сборка и запуск контейнеров
sudo docker compose up -d --build

# Проверка статуса
sudo docker compose ps

# Просмотр логов
sudo docker compose logs -f
```

---

## Шаг 9: Настройка SSL (рекомендуется для production)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL-сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление сертификатов
sudo systemctl status certbot.timer
```

---

## Шаг 10: Настройка брандмауэра (UFW)

```bash
# Установка UFW (если не установлен)
sudo apt install -y ufw

# Разрешение SSH
sudo ufw allow OpenSSH

# Разрешение HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Включение брандмауэра
sudo ufw enable

# Проверка статуса
sudo ufw status
```

---

## Управление сервисами

### Просмотр статуса

```bash
sudo docker compose ps
```

### Просмотр логов

```bash
# Все сервисы
sudo docker compose logs -f

# Конкретный сервис
sudo docker compose logs -f backend
sudo docker compose logs -f frontend
```

### Перезапуск

```bash
sudo docker compose restart
```

### Обновление проекта

```bash
cd /opt/mobile_coffee

# Обновление кода (для Git)
git pull origin main

# Пересборка и перезапуск
sudo docker compose up -d --build
```

### Остановка

```bash
sudo docker compose down
```

### Остановка с удалением данных

```bash
sudo docker compose down -v
```

---

## Мониторинг

### Установка Docker-контейнеров мониторинга (опционально)

```bash
# cAdvisor для мониторинга контейнеров
sudo docker run -d \
  --name=cadvisor \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=8080:8080 \
  gcr.io/cadvisor/cadvisor:latest
```

### Проверка использования ресурсов

```bash
# Использование Docker
sudo docker stats

# Использование дискового пространства
sudo docker system df

# Очистка неиспользуемых данных
sudo docker system prune -a
```

---

## Автоматический запуск при загрузке

Docker Compose с `restart: always` автоматически запускает контейнеры при загрузке системы.

### Проверка:

```bash
# Перезагрузка сервера
sudo reboot

# После перезагрузки проверка статуса
sudo docker compose ps
```

---

## Решение проблем

### Контейнер не запускается

```bash
# Проверка логов
sudo docker compose logs backend

# Проверка использования портов
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :80
```

### Ошибки базы данных

```bash
# Остановка и удаление тома
sudo docker compose down -v

# Запуск заново
sudo docker compose up -d --build
```

### Nginx не работает

```bash
# Проверка статуса
sudo systemctl status nginx

# Проверка логов
sudo journalctl -u nginx -f

# Тест конфигурации
sudo nginx -t
```

### Недостаточно памяти

```bash
# Проверка использования памяти
free -h
sudo docker stats

# Остановка неиспользуемых контейнеров
sudo docker stop $(sudo docker ps -aq)
```

---

## Безопасность

### Регулярное обновление

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Обновление Docker образов
sudo docker compose pull
sudo docker compose up -d
```

### Ограничение доступа к API

Добавьте в конфигурацию Nginx:

```nginx
# Ограничение по IP для /docs
location /docs {
    allow 192.168.1.0/24;  # Ваша сеть
    deny all;
    proxy_pass http://localhost:8000/docs;
}
```

---

## Чек-лист после развёртывания

- [ ] Сервер доступен по домену
- [ ] SSL-сертификат установлен и работает
- [ ] Frontend загружается корректно
- [ ] Backend API отвечает (проверка `/health`)
- [ ] API документация доступна
- [ ] Брандмауэр настроен
- [ ] Автоматический запуск при загрузке работает
- [ ] Логи записываются корректно
- [ ] Резервное копирование настроено

---

## Резервное копирование базы данных

```bash
# Создание бэкапа
sudo docker cp mobile_coffee_backend:/app/data/coffee_shop.db ./backup_coffee_shop_$(date +%Y%m%d).db

# Восстановление из бэкапа
sudo docker cp backup_coffee_shop.db mobile_coffee_backend:/app/data/coffee_shop.db
sudo docker compose restart backend
```

### Автоматизация бэкапа (cron)

```bash
# Редактирование crontab
crontab -e

# Добавление задачи (ежедневно в 3:00)
0 3 * * * cd /opt/mobile_coffee && docker cp mobile_coffee_backend:/app/data/coffee_shop.db /backups/coffee_shop_$(date +\%Y\%m\%d).db
```

---

## Контакты и поддержка

При возникновении проблем обратитесь к документации:
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
