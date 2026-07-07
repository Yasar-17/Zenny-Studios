require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const enquiryRoutes = require('./routes/enquiries');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Zenny Studios API', docs: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Zenny Studios API running on http://localhost:${PORT}`);
});
