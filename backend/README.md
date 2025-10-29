# 🐋 Marine Species Tracker — Backend (Django + GeoDjango + PostGIS)

This backend uses **Django** with **GeoDjango** and **PostGIS** for geospatial functionalities.
**All development and commands are intended to be run inside Docker containers** (not your host system).

---

## 🛠️ Dependency Management

This backend **now uses [Poetry](https://python-poetry.org/)** instead of `requirements.txt` for all Python package management.

### 🐍 How to install dependencies

- Dependencies are listed in `pyproject.toml` and `poetry.lock`.

- **Install everything (inside the backend container):**
  ```sh
  docker-compose run --rm backend poetry install
  ```

  - This will:
    - Create a virtual environment (if running locally—not inside Docker).
    - Install all main, development, and system-packaged dependencies.

- **Add a new runtime dependency:**
  ```sh
  docker-compose run --rm backend poetry add <package-name>
  ```

- **Add a new development dependency:**
  ```sh
  docker-compose run --rm backend poetry add --dev <package-name>

## 🚀 Quick Start

1. **Start all services ([backend, frontend, PostGIS DB]):**
    ```sh
    docker-compose up --build
    ```
    - The backend will be available at [http://localhost:8000](http://localhost:8000).
    - The PostGIS database will be available to containers as `db:5432`.

---

## 🛠️ Running Django Commands (always inside Docker)

**Examples:**

- **Django shell:**
    ```sh
    docker-compose exec backend python manage.py shell
    ```

- **Run migrations:**
    ```sh
    docker-compose exec backend python manage.py makemigrations
    docker-compose exec backend python manage.py migrate
    ```

- **Create a superuser:**
    ```sh
    docker-compose exec backend python manage.py createsuperuser
    ```

- **Run tests:**
    ```sh
    docker-compose exec backend pytest
    # or
    docker-compose exec backend python manage.py test
    ```

    docker-compose exec backend python manage.py shelln:**
  [http://localhost:8000/admin](http://localhost:8000/admin)

- **Access Postgres shell (psql):**
    ```sh
    docker-compose exec db psql -U postgres -d marine_tracker
    ```

- **Rebuild backend image if you change dependencies:**
    ```sh
    docker-compose build backend
    docker-compose up
    ```

---

## 🧭 Spatial Library Setup (Important!)

- **All required system libraries** (`gdal`, `geos`, `proj`) are preinstalled _inside the backend Docker container_.
- **Ignore all spatial library errors** if running Django commands outside Docker—they do _not_ apply to this workflow.
- **Do not use your host Python/venv for backend tasks!**

---

## 🐘 Database (PostGIS)

- The PostGIS database is set up by Docker as the `db` service.
- Default connection settings inside Docker:
    HOST: db
    PORT: 5432
    DATABASE: marine_tracker
    USER: postgres
    PASSWORD: postgres

## 👤 User Authentication & Custom User System

This backend implements a **custom user model** (see `users/` app) with role support and JWT (cookie-based) authentication via Django REST Framework + SimpleJWT.

### Highlights
- **Custom User Model**: Uses email as the primary identifier, with unique username and role fields. Extend or adjust in `users/models.py`.
- **Registration, Login, Logout, and Profile**: Complete user management endpoints.
- **JWT Auth via HttpOnly Cookies**, not localStorage/sessionStorage.
- **Security**: Production-grade, with SameSite, Secure, and HttpOnly cookie flags set appropriately (see `users/views.py`).

### Key Endpoints

| Endpoint          | Method | Description                    | Requires Auth? |
|-------------------|--------|--------------------------------|---------------|
| `/api/v1/auth/register/`      | POST   | User registration              | No  |
| `/api/v1/auth/login/`         | POST   | User login, sets JWT cookie    | No  |
| `/api/v1/auth/logout/`        | POST   | Removes JWT cookie (logout)    | Yes |
| `/api/v1/auth/profiles/me/`   | GET    | Current user's profile         | Yes |

**Login/Logout flow uses JWTs in cookies:**
- Tokens are validated by custom middleware on every protected API call, including logout.
- All protected endpoints (`IsAuthenticated`) require the `access_token` cookie.

### Roles & Permissions
- Custom roles can be added/managed in `users/models.py` for future admin/moderator logic.
- [Django admin interface](http://localhost:8000/admin) gives you superuser/role management.

### Adding More User Endpoints
- See `users/views.py` for class-based views. Add new endpoints in `users/urls.py` as needed.

---

For more, see the in-code docstrings in `users/serializers.py`, `users/views.py`, and the OpenAPI docs at `/api/v1/docs/` (Swagger UI).


## 🦺 Troubleshooting

- **Spatial library errors (GDAL/GEOS/PROJ):**
  Make sure you’re always running commands _inside the container_, not on your host.

- **Database errors:**
  Double-check that you’re using Docker Compose and that all containers are running.

---

## ✅ Recap

- ✔️ **Always** use Docker for backend commands: `docker-compose exec backend ...`
- ✔️ No need to set up geospatial libs or Python venv on your host.
- ✔️ If you see GDAL/GEOS errors on Mac, they're safe to ignore (just use Docker!).
- ✔️ Database and backend are ready out of the box with Docker Compose.
