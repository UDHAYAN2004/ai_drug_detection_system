# DrugShield — Admin Frontend

React + Vite + Tailwind CSS admin dashboard for the AI Drug Detection System.

## Requirements
- Node.js 18+ (https://nodejs.org/)
- Backend running at http://localhost:8000

## Setup

### Windows
1. Double-click `setup.bat` to install dependencies
2. Double-click `start.bat` to run

### Manual
```bash
npm install
npm run dev
```

Open: http://localhost:5173

## Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | /login | Admin authentication |
| Dashboard | /dashboard | Stats + charts overview |
| Users | /users | Manage all users |
| Reports | /reports | Medical reports + verification |
| Investigations | /investigations | Case management |
| Activity Logs | /activity-logs | System audit log |
| Analytics | /analytics | Charts & trends |

## Project Structure
```
src/
├── api/          # Axios API calls per resource
├── components/
│   ├── common/   # Layout, Sidebar, Navbar, Table, Modal
│   └── charts/   # Recharts components
├── pages/        # One file per page
├── store/        # Zustand auth state
└── utils/        # Helpers, constants, token utils
```
