const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const ticketRoutes = require('./src/routes/tickets.route');
const uploadRoutes = require('./src/routes/uploads.route');

dotenv.config();
connectDB();

const app = express();

// Middleware - CORS: allow frontend domain
const corsOptions = {
  origin: [
    'https://www.wnryouthcongress.co.za',
    'https://wnryouthcongress.co.za',
    /^http:\/\/localhost(:\d+)?$/,
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files - for accessing uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Youth Congress 2026 API' });
});

app.get('/api', (req, res) => {
    res.json({ message: 'Youth Congress 2026 API' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is in use. Killing the process holding it...`);
        const { execSync } = require('child_process');
        try {
            const result = execSync(
                `netstat -ano | findstr ":${PORT}" | findstr "LISTENING"`,
                { encoding: 'utf8' }
            );
            const pid = result.trim().split(/\s+/).pop();
            if (pid && pid !== String(process.pid)) {
                execSync(`taskkill /F /PID ${pid}`);
                console.log(`Killed PID ${pid}. Retrying...`);
                setTimeout(() => {
                    server.listen(PORT, () => {
                        console.log(`Server is running on port ${PORT}`);
                    });
                }, 1000);
                return;
            }
        } catch (_) { /* port holder already gone */ }
        console.error(`Could not free port ${PORT}. Exiting.`);
        process.exit(1);
    } else {
        throw err;
    }
});