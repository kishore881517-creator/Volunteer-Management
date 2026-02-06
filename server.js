const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const eventsRoutes = require('./routes/events');
const volunteersRoutes = require('./routes/volunteers');
const updatesRoutes = require('./routes/updates');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/volunteer_management';

const MAX_MONGO_RETRIES = parseInt(process.env.MONGO_MAX_RETRIES, 10) || 5;
let mongoConnectAttempts = 0;

function connectWithRetry() {
  mongoConnectAttempts += 1;
  console.log(`MongoDB connection attempt ${mongoConnectAttempts}/${MAX_MONGO_RETRIES} to ${MONGO_URI}`);

  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);

      if (mongoConnectAttempts >= MAX_MONGO_RETRIES) {
        console.error(`Failed to connect to MongoDB after ${mongoConnectAttempts} attempts. Exiting.`);
        console.error('If you expect a local MongoDB, start it (e.g., `mongod` or start the MongoDB service) or set MONGO_URI to a running instance/Atlas cluster.');
        // give the logs a moment to flush
        setTimeout(() => process.exit(1), 100);
        return;
      }

      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();

app.get('/', (req, res) => {
  res.send('Volunteer Management Backend');
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/updates', updatesRoutes);

// Start server (only once)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});