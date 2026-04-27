import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'malkhana-secret-key';
const DATA_FILE = path.join(process.cwd(), 'data.json');

app.use(cors());
app.use(express.json());

// Initial data structure
const initialData = {
  users: [
    { id: '1', username: 'admin', password: '', role: 'admin', name: 'Admin Officer' },
    { id: '2', username: 'staff', password: '', role: 'staff', name: 'Malkhana Staff' }
  ],
  items: [],
  backlog: []
};

// Initialize data file if not exists
if (!fs.existsSync(DATA_FILE)) {
  // Hash default passwords
  const salt = bcrypt.genSaltSync(10);
  initialData.users[0].password = bcrypt.hashSync('admin123', salt);
  initialData.users[1].password = bcrypt.hashSync('staff123', salt);
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

const getData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const saveData = (data: any) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// --- Auth Routes ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = getData();
  const user = data.users.find((u: any) => u.username === username);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- Item Routes ---
app.get('/api/items', (req, res) => {
  const data = getData();
  res.json(data.items);
});

app.post('/api/items', (req, res) => {
  const data = getData();
  const newItem = {
    ...req.body,
    id: `ITEM-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  data.items.push(newItem);
  saveData(data);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const data = getData();
  const index = data.items.findIndex((i: any) => i.id === req.params.id);
  if (index !== -1) {
    data.items[index] = { ...data.items[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData(data);
    res.json(data.items[index]);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  const data = getData();
  const itemToDelete = data.items.find((i: any) => i.id === req.params.id);
  if (itemToDelete) {
    data.backlog.push({
      ...itemToDelete,
      deletedAt: new Date().toISOString(),
      deletedBy: req.query.deletedBy || 'System'
    });
    data.items = data.items.filter((i: any) => i.id !== req.params.id);
    saveData(data);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.get('/api/backlog', (req, res) => {
  const data = getData();
  res.json(data.backlog || []);
});

app.post('/api/backlog/restore/:id', (req, res) => {
  const data = getData();
  const backlogIndex = data.backlog.findIndex((i: any) => i.id === req.params.id);
  if (backlogIndex !== -1) {
    const itemToRestore = data.backlog[backlogIndex];
    // Remove from backlog
    data.backlog.splice(backlogIndex, 1);
    // Add back to items
    const { deletedAt, deletedBy, ...rest } = itemToRestore;
    data.items.push({
      ...rest,
      restoredAt: new Date().toISOString()
    });
    saveData(data);
    res.json({ message: 'Item restored successfully' });
  } else {
    res.status(404).json({ error: 'Item not found in backlog' });
  }
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server running on ${url}`);
    
    // Automatically open the browser
    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    import('child_process').then(({ exec }) => {
      exec(`${startCmd} ${url}`);
    });
  });
}

startServer();
