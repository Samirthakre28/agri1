const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/agricontract')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/analytics', require('./routes/analytics'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
