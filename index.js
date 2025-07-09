require('dotenv').config();

const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');
const contactRoutes = require('./routes/contact');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/analyze', analyzeRouter);
app.use('/contact', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
