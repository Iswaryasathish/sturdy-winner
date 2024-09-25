const express = require('express');
const connectDB = require('./config/db');
const eventRouter = require('./routes/events');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const moment = require('moment');

const app = express();




connectDB();

app.use(cors(
    {
        origin: '*', // Allow your frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
        credentials: true // Allow cookies if needed
      }
));

app.use(express.json());
app.use(bodyParser.json());

// Event routes
app.use('/api/events', eventRouter);

// Other routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employee'));





const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));   