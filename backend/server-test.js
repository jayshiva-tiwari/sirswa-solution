const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Auth test route
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth test route works!' });
});

// Login route - Direct implementation
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email, password);
  
  if (email === 'admin@example.com' && password === 'admin123') {
    res.json({
      token: 'test-token-123',
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// List all routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      routes.push(`${Object.keys(r.route.methods)} ${r.route.path}`);
    }
  });
  res.json({ routes });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/auth/test`);
});