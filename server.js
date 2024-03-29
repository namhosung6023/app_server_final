const express = require('express');
//const morgan = require('morgan')
const cors = require('cors');
const connectDB = require('./config/db');
//const passport = require('passport')
const bodyParser = require('body-parser');
const accounts = require('./routes/accounts');
const trainer = require('./routes/trainer');
const premium = require('./routes/premium');
const history = require('./routes/history');
const file = require('./routes/file');
const beta = require('./routes/beta');

connectDB();

const app = express();

// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'))
// }

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/accounts', accounts);
app.use('/trainer', trainer);
app.use('/premium', premium);
app.use('/history', history);
app.use('/file', file);
app.use('/beta', beta);
//app.use(passport.initialize())
//require('./config/passport')(passport)

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
