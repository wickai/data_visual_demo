# Inventory Data Visualization System

A full-stack data visualization application for inventory management and analytics.

## Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Features**: RESTful APIs, data processing, user authentication
- **Database**: SQLite with SQLAlchemy ORM

### Frontend
- **Framework**: React
- **UI Library**: Ant Design components
- **Build Tool**: Vite
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (LTS version)
- Python 3.8+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory and run the development script:

```bash
cd backend && sh dev.sh
```

This will:
- Install Python dependencies
- Initialize the database
- Start the FastAPI development server

2. **Manual Setup** (if needed):

If you prefer to set up the backend manually:

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize the database
python -m src.scripts.init_db

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

This will create the database tables and set up the initial schema.

### Frontend Setup

1. Install and use the latest LTS version of Node.js:
```bash
nvm install --lts
nvm use --lts
```

2. Navigate to the frontend directory and install dependencies:
```bash
cd frontend/
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:8000`

## Docker Deployment (Recommended)

### Quick Start

1. **Clone the repository**:
```bash
git clone YOUR_REPO_URL
cd AIBUILD_data_visual
```

2. **Make the deployment script executable**:
```bash
chmod +x deploy.sh
```

3. **Run the deployment script**:
```bash
./deploy.sh
```

The script will automatically:
- Detect your public IP
- Build Docker images
- Start frontend and backend services
- Display access URLs

### Manual Docker Commands

```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

### Access Points

- **Frontend**: `http://YOUR_IP:5173`
- **Backend API**: `http://YOUR_IP:8000`
- **API Documentation**: `http://YOUR_IP:8000/docs`

## Features

- **User Authentication**: Secure login system
- **Data Import**: Excel file upload and processing
- **Data Visualization**: Interactive charts and dashboards
- **Inventory Analytics**: Product comparison and trend analysis
- **Responsive Design**: Mobile-friendly interface

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── database/       # Database models and connections
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── utils/          # Utility functions
│   │   └── scripts/        # Database initialization scripts
│   ├── main.py            # FastAPI application entry point
│   └── requirements.txt   # Python dependencies
└── frontend/              # React frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── App.jsx       # Main application component
    │   └── api.js        # API client
    ├── package.json      # Node.js dependencies
    └── vite.config.js    # Vite configuration
```

## Development

- Backend runs on port 8000
- Frontend runs on port 5173
- API documentation available at `http://localhost:8000/docs`

## License

This project is licensed under the MIT License.