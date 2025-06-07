require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Get list of all sheets
app.get('/sheets', async (req, res) => {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const sheets = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    res.json(sheets);
  } catch (err) {
    console.error('Error reading sheets:', err);
    res.status(500).json({ error: 'Failed to read sheets' });
  }
});

// Get sheet data
app.get('/sheets/:name', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.name}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading sheet:', err);
    res.status(404).json({ error: 'Sheet not found' });
  }
});

// Create new sheet
app.post('/sheets', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Sheet name is required' });
    }

    const filePath = path.join(DATA_DIR, `${name}.json`);
    try {
      await fs.access(filePath);
      return res.status(400).json({ error: 'Sheet already exists' });
    } catch (err) {
      // File doesn't exist, proceed with creation
    }

    await fs.writeFile(filePath, JSON.stringify([], null, 2));
    res.status(201).json({ message: 'Sheet created successfully' });
  } catch (err) {
    console.error('Error creating sheet:', err);
    res.status(500).json({ error: 'Failed to create sheet' });
  }
});

// Save sheet data
app.post('/sheets/:name', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.name}.json`);
    await fs.writeFile(filePath, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Sheet saved successfully' });
  } catch (err) {
    console.error('Error saving sheet:', err);
    res.status(500).json({ error: 'Failed to save sheet' });
  }
});

// Rename sheet
app.put('/sheets/:name', async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) {
      return res.status(400).json({ error: 'New name is required' });
    }

    const oldPath = path.join(DATA_DIR, `${req.params.name}.json`);
    const newPath = path.join(DATA_DIR, `${newName}.json`);

    try {
      await fs.access(newPath);
      return res.status(400).json({ error: 'Sheet with new name already exists' });
    } catch (err) {
      // New name doesn't exist, proceed with rename
    }

    await fs.rename(oldPath, newPath);
    res.json({ message: 'Sheet renamed successfully' });
  } catch (err) {
    console.error('Error renaming sheet:', err);
    res.status(500).json({ error: 'Failed to rename sheet' });
  }
});

// Delete sheet
app.delete('/sheets/:name', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.name}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Sheet deleted successfully' });
  } catch (err) {
    console.error('Error deleting sheet:', err);
    res.status(500).json({ error: 'Failed to delete sheet' });
  }
});

// Send to Telegram
app.post('/send-to-telegram', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      return res.status(400).json({ error: 'Telegram not configured' });
    }

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    res.json({ message: 'Message sent to Telegram', response: response.data });
  } catch (err) {
    console.error('Error sending to Telegram:', err);
    res.status(500).json({ error: 'Failed to send message to Telegram' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  ensureDataDir().then(() => console.log('Data directory ready'));
});