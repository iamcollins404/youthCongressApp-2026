# Youth Congress 2026

MERN Stack Monorepo - MongoDB, Express, React, Node.js

## Structure

```
youthCongressApp-2026/
├── api/                 # Express backend (port 5000)
│   └── src/
│       ├── server.js    # Entry point
│       ├── config/      # Database config
│       ├── models/      # Mongoose models
│       ├── routes/      # API routes
│       └── middleware/   # Multer upload config
├── client/              # React Vite frontend (port 5173)
│   └── src/
│       ├── main.jsx     # Entry point
│       └── App.jsx      # Main component
└── package.json         # Monorepo workspaces config
```

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies (runs at root, installs both api and client)
npm install
```

### Environment Setup

Create a `.env` file in the `api/` folder (see `api/.env.example`):

```env
MONGODB_URI=mongodb://localhost:27017/youth-congress-2026
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Running Development Servers

```bash
# Run both API and Client simultaneously
npm run dev
```

This will start:
- **API**: http://localhost:5000
- **Client**: http://localhost:5173

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both servers in parallel |
| `npm run dev:api` | Run only the API server |
| `npm run dev:client` | Run only the React client |
| `npm run build` | Build the client for production |
| `npm start` | Start the API in production mode |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API welcome message |
| GET | `/health` | Health check |
| GET | `/api/tickets` | List all tickets |
| GET | `/api/tickets/admin/stats` | Dashboard statistics |
| GET | `/api/tickets/:ticketId` | Get single ticket |
| POST | `/api/tickets/new` | Public registration |
| POST | `/api/tickets/admin/create` | Admin create ticket |
| PATCH | `/api/tickets/:ticketId/status` | Update ticket status |
| PATCH | `/api/tickets/:ticketId/edit` | Edit ticket fields |
| POST | `/api/uploads/file` | Upload file (passport/payment) |

## Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS 4
- **Backend**: Express 4, Node.js
- **Database**: MongoDB with Mongoose
- **Monorepo**: npm workspaces + concurrently

