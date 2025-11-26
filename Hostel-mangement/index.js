const express = require('express');
const app = express();

const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello! Your Express server is running 🚀');
});

// Sample API route
app.get('/api/data', (req, res) => {
  res.json({
    message: "Here is some API data",
    timestamp: Date.now()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
