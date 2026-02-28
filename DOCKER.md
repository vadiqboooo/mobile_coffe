# Docker Configuration for Mobile Coffee Project

This project uses Docker Compose to run both frontend and backend services.

## Quick Start

### Build and Run

```bash
docker-compose up --build
```

### Run in Detached Mode

```bash
docker-compose up -d --build
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

## Services

| Service    | Port | Description           |
|------------|------|-----------------------|
| Frontend   | 80   | React + Vite (nginx)  |
| Backend    | 8000 | FastAPI + uvicorn     |

## Access

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Development

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild Services

```bash
# Rebuild backend only
docker-compose up -d --build backend

# Rebuild frontend only
docker-compose up -d --build frontend
```

### Execute Commands in Containers

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh
```

## Production Deployment

For production, update the `docker-compose.yml`:

1. Set proper environment variables
2. Use a production database (PostgreSQL, MySQL)
3. Add SSL/TLS termination
4. Configure proper domain names
5. Set up backup strategies for volumes

## Troubleshooting

### Database Issues

If you encounter database issues, reset the volume:

```bash
docker-compose down -v
docker-compose up -d --build
```

### Port Conflicts

If ports 80 or 8000 are in use, modify the `ports` section in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"    # Frontend on port 8080
  - "8001:8000"  # Backend on port 8001
```
