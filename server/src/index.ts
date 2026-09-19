import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import topicRoutes from './routes/topics';
import problemRoutes from './routes/problems';
import progressRoutes from './routes/progress';
import noteRoutes from './routes/notes';
import uploadRoutes from './routes/uploads';
import mistakeRoutes from './routes/mistakes';
import statisticsRoutes from './routes/statistics';
import searchRoutes from './routes/search';
import importRoutes from './routes/import';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Rate limiting for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: 'Too many upload requests, please try again later.',
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/uploads', uploadLimiter, uploadRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/import', importRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
