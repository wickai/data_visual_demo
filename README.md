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

Navigate to the backend directory and run the development script:

```bash
cd backend && sh dev.sh
```

This will:
- Install Python dependencies
- Initialize the database
- Start the FastAPI development server

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