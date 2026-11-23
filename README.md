# Food Archive

Food Archive is a recipe-sharing application with an Ionic/Angular frontend and a
FastAPI backend backed by MySQL.

## Project layout

```text
backend/
  food_archive_api/
    routes/                 # API routes grouped by feature
    config.py               # Environment settings and upload location
    database.py             # MySQL connection dependency
    dependencies.py         # Authentication and authorization
    models.py               # Request models
    utils.py                # Shared data and validation helpers
    main.py                 # FastAPI app setup
  main.py                   # Backward-compatible Uvicorn entry point
  requirements.txt
food_archive/
  src/app/                  # Angular pages grouped by feature
  src/app/services/         # API services
```

## Run the backend

From the repository root, create a local virtual environment and install the
backend dependencies:

```cmd
cd backend
python -m venv .venv 
.venv\Scripts\Activate.bat

python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The API documentation is available at <http://127.0.0.1:8000/docs>. Configure
MySQL with `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. Optional
settings are `ADMIN_EMAIL` and `SESSION_COOKIE_SECURE`. These may be placed in a
local `backend/.env` file.

## Run the frontend

In another terminal:

```cmd
cd food_archive
ionic serve
```

The development server is available at <http://localhost:4200>. The API base
URL is configured in `food_archive/src/environments/`.

The frontend is already feature-oriented; pages stay together with their
templates and styles, while shared API access stays under `src/app/services/`.
