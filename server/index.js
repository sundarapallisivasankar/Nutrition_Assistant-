import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Configurations and Database
import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import trackerRoutes from './routes/trackerRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Error Handler Middlewares
import { errorHandler, notFoundHandler } from './middleware/error.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows displaying local uploaded photos in frontend
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite standard dev port
  'http://localhost:3000',
  'https://nutrition-assistant-client.vercel.app' // Example production URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads Folder
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Nutrition Assistant REST API. System online.',
  });
});

// Centralized 404 Route
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
