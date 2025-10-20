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
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
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
