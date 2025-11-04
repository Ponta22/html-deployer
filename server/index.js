'use strict';
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const cors = require('cors');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;
const STORAGE_DIR = path.join(__dirname, '..', 'sites');
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/create', (req, res) => {
  const html = req.body && req.body.html;
  if (!html) return res.status(400).json({ error: 'Missing html in request body' });
  const id = nanoid(10);
  const dir = path.join(STORAGE_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'index.html');
  fs.writeFileSync(filePath, html, 'utf8');
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return res.json({ id, url: `${baseUrl}/s/${id}` });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded under field "file"' });
  const contentType = req.file.mimetype || '';
  if (!contentType.includes('html') && !contentType.includes('text')) {
    return res.status(400).json({ error: 'Uploaded file does not appear to be HTML' });
  }
  const id = nanoid(10);
  const dir = path.join(STORAGE_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'index.html');
  fs.writeFileSync(filePath, req.file.buffer);
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return res.json({ id, url: `${baseUrl}/s/${id}` });
});

app.get('/s/:id', (req, res) => {
  const id = req.params.id;
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return res.status(400).send('Invalid id');
  const filePath = path.join(STORAGE_DIR, id, 'index.html');
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(filePath);
});

app.get('/api/raw/:id', (req, res) => {
  const id = req.params.id;
  const filePath = path.join(STORAGE_DIR, id, 'index.html');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  const html = fs.readFileSync(filePath, 'utf8');
  res.json({ id, html });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
