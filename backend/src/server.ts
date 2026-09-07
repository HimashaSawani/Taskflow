import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase, disconnectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';
import activityRoutes from './routes/activity.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP Security Headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL || '',
  process.env.CORS_ORIGIN || '',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in local development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome & status endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'TaskFlow API Server is running smoothly!',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ensure database connection and admin account for serverless invocations
app.use(async (_req: Request, _res: Response, next) => {
  try {
    await connectDatabase();
    await autoSeedAdminIfMissing();
  } catch (err) {
    console.error('Database connection middleware error:', err);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);

// 404 Fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use(errorHandler);

const autoSeedAdminIfMissing = async () => {
  try {
    const { User } = await import('./models/User');
    const { Task } = await import('./models/Task');
    const { Activity } = await import('./models/Activity');
    const { hashPassword } = await import('./utils/password');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@taskflow.com').toLowerCase().trim();
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'AdminPassword123!');
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`[Seed] Created initial Admin account: ${adminEmail}`);

      const taskCount = await Task.countDocuments();
      if (taskCount === 0) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 5);

        const tasks = await Task.create([
          {
            title: 'Implement Authentication System',
            description: 'Set up JWT token generation, verification, bcrypt password hashing, and cookie/header auth.',
            status: 'DONE',
            priority: 'HIGH',
            dueDate: new Date(),
            creator: admin._id,
            assignedUser: admin._id,
          },
          {
            title: 'Design Drag-and-Drop Task Board',
            description: 'Construct interactive Kanban columns (TO DO, DOING, DONE) using @dnd-kit with real-time feedback.',
            status: 'DOING',
            priority: 'HIGH',
            dueDate: nextWeek,
            creator: admin._id,
            assignedUser: admin._id,
          },
          {
            title: 'Setup Production Deployment Pipeline',
            description: 'Configure automated CI/CD for Next.js on Vercel and Node.js Express backend on Render/Railway.',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: nextWeek,
            creator: admin._id,
            assignedUser: null,
          },
          {
            title: 'Role-Based Access Control Auditing',
            description: 'Ensure normal users cannot see other users or reassign unauthorized tasks.',
            status: 'TODO',
            priority: 'LOW',
            dueDate: nextWeek,
            creator: admin._id,
            assignedUser: null,
          },
        ]);

        await Activity.create([
          {
            user: admin._id,
            task: tasks[0]._id,
            action: 'CREATED',
            message: 'Admin User created task "Implement Authentication System"',
          },
          {
            user: admin._id,
            task: tasks[1]._id,
            action: 'STATUS_CHANGED',
            message: 'Admin User moved task "Design Drag-and-Drop Task Board" to DOING',
          },
        ]);
        console.log('[Seed] Created initial sample tasks & activities.');
      }
    }

    // Ensure demo Member account exists
    const memberEmail = 'alex@taskflow.com';
    let member = await User.findOne({ email: memberEmail });
    if (!member) {
      const memberPasswordHash = await hashPassword('Password123!');
      member = await User.create({
        name: 'Alex Rivera',
        email: memberEmail,
        password: memberPasswordHash,
        role: 'user',
      });
      console.log(`[Seed] Created initial Member account: ${memberEmail}`);
    } else {
      // Re-hash password if needed to guarantee login
      const isMatch = await (await import('bcryptjs')).compare('Password123!', member.password);
      if (!isMatch) {
        member.password = await hashPassword('Password123!');
        await member.save();
        console.log(`[Seed] Reset demo member password to Password123!`);
      }
    }
  } catch (err) {
    console.warn('[Seed] Auto-seed check failed:', err);
  }
};

const startServer = async () => {
  try {
    await connectDatabase();
    await autoSeedAdminIfMissing();

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Task Manager API Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`=========================================`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await disconnectDatabase();
        console.log('Server and database shut down successfully.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start standalone HTTP server in non-serverless environments
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
