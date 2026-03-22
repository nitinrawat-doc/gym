require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Init DB (creates tables + seeds default trainer)
require('./db');

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/members',   require('./routes/members'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ True Fitness server running on http://localhost:${PORT}`);
  console.log('📧 Default login: trainer@truefitness.com / trainer123\n');
});
