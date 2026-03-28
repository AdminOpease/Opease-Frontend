import cors from 'cors';

const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:8081')
  .split(',')
  .map((o) => o.trim());

export default cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
