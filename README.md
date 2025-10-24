# Marine Species Observation Tracker

Empower divers, biologists, and hobbyists to log, explore, and contribute to marine species observations—all on an interactive map.

## 🌊 Project Overview

This platform bridges citizen science and professional research, making it easy to track biodiversity, share discoveries, and access verified species data from global databases (GBIF/OBIS/iNaturalist).

## 🏗️ Tech Stack

### Backend
- **Framework:** Django + Django REST Framework
- **Database:** PostgreSQL with PostGIS
- **Storage:** AWS S3
- **APIs:** GBIF, OBIS, iNaturalist

### Frontend
- **Framework:** Next.js (React) + TypeScript
- **Maps:** Leaflet / Mapbox GL JS
- **Styling:** Tailwind CSS

### DevOps
- **CI/CD:** GitHub Actions
- **Deployment:** AWS EC2 (Backend), AWS Amplify (Frontend)
- **Monitoring:** AWS CloudWatch + Sentry

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ with PostGIS
- Docker (optional)

### Backend Setup

> **All backend development and commands must be run inside Docker containers.**

```bash
cd backend
docker-compose up --build        
# Backend available at http://localhost:8000
```

- To install backend dependencies:
  ```sh
  docker-compose run --rm backend poetry install
  ```

- To run Django commands (migrations, shell, tests, etc.):
  ```sh
  docker-compose exec backend python manage.py <command>
  ```
  Examples:
  - `docker-compose exec backend python manage.py migrate`
  - `docker-compose exec backend python manage.py createsuperuser`
  - `docker-compose exec backend pytest`

- Access the admin: [http://localhost:8000/admin](http://localhost:8000/admin)

- Access the Postgres shell:
  ```sh
  docker-compose exec db psql -U postgres -d marine_tracker
  ```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
marine-species-tracker/
├── backend/          # Django REST API
├── frontend/         # Next.js application
├── scripts/          # Deployment and utility scripts
└── .github/          # CI/CD workflows
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - See LICENSE file for details
