import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { checkPaymentStatus } from './jobs/paymentJob.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import groupRoutes from './routes/groups.js';
import studentRoutes from './routes/students.js';
import leadRoutes from './routes/leads.js';
import paymentRoutes from './routes/payments.js';
import attendanceRoutes from './routes/attendance.js';
import dashboardRoutes from './routes/dashboard.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Function to create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'muhammadazizyaqubov2@gmail.com';
    const adminPassword = 'Azizbek0717';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = new User({
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN'
      });

      await adminUser.save();
      console.log('✅ Default admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log('🔐 Password: (configured in code)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin user:', error);
  }
};

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://infast-crm.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: (incomingOrigin, callback) => {
    if (!incomingOrigin) {
      // Allow server-to-server or tools like curl/postman without origin header.
      return callback(null, true);
    }

    const matchesAllowedDomain =
      allowedOrigins.includes(incomingOrigin) || incomingOrigin.endsWith('.vercel.app');

    if (matchesAllowedDomain) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy blocked request from ${incomingOrigin}`));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://infastaiuz_db_user:Shodiyona@infast-ai.kuaftll.mongodb.net/infastcrm?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected');
  await createDefaultAdmin();
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Daily job to check payment status (runs at 9 AM every day)
cron.schedule('0 9 * * *', () => {
  console.log('🔄 Running daily payment status check...');
  checkPaymentStatus();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

