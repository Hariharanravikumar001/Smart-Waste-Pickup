const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const mongoURI = "mongodb://admin:admin123@ac-fft6zbl-shard-00-00.kasfsbc.mongodb.net:27017,ac-fft6zbl-shard-00-01.kasfsbc.mongodb.net:27017,ac-fft6zbl-shard-00-02.kasfsbc.mongodb.net:27017/wastezero?ssl=true&replicaSet=atlas-ggz0rh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=hariharan";

mongoose.connect(mongoURI)
.then(() => console.log('MongoDB Atlas Connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', require('./routes/auth'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
