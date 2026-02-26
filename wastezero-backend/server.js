const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/wastezero', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', require('./routes/auth'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
