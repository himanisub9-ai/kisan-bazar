# Kisan Bazar 🌾

A modern digital marketplace connecting farmers directly with buyers.

---

## 🚀 Features

- **Direct Farmer-to-Consumer Marketplace**: Eliminates middlemen, ensuring fair prices for farmers and fresh produce for buyers.
- **Product Catalog & Management**: Search, filter, and view agricultural products with real-time availability and pricing.
- **FastAPI Backend**: High-performance RESTful API with automated Swagger/OpenAPI documentation.
- **Modern React Frontend**: Fast, responsive single-page application powered by Vite.
- **Cart & Order Flow**: Integrated cart context and streamlined checkout system.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Frontend**: React, React Router, Vite, Axios, Lucide Icons / Custom CSS
- **Database**: PostgreSQL / SQLite

---

## 📦 Project Structure

```text
Kisan Bazar/
├── backend/
│   ├── app/
│   │   ├── auth/          # Authentication & JWT tokens
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── routers/       # API endpoints & routes
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # Business logic services
│   │   ├── database.py    # Database connection & session setup
│   │   └── main.py        # FastAPI entrypoint
│   ├── requirements.txt   # Python dependencies
│   ├── seed.py            # Sample data seeder
│   └── .env.example       # Example environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # State management (Cart, Auth, etc.)
│   │   ├── pages/         # Page views
│   │   ├── services/      # API client services
│   │   ├── App.js         # Root application component
│   │   └── index.css      # Core styles
│   ├── package.json       # Frontend dependencies & scripts
│   └── vite.config.js     # Vite configuration
├── run.bat                # Windows one-click launcher
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & npm

### Quick Start (Windows)

Simply double-click [`run.bat`](run.bat) or run:

```cmd
run.bat
```

This will launch both backend (FastAPI) and frontend (React/Vite) servers in separate windows.

---

### Manual Setup

#### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate  # On macOS/Linux

pip install -r requirements.txt
cp .env.example .env       # Configure your environment variables

# (Optional) Seed initial data
python seed.py

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Web App: `http://localhost:5173`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
