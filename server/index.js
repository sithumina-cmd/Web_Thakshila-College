import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './apiRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app = express();

// Mount REST API
app.use(apiApp);

// Explicitly serve /Pictures from workspace Pictures folder
const picturesPath = path.join(__dirname, '..', 'Pictures');
app.use('/Pictures', express.static(picturesPath));

// Serve built React frontend if available
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Thakshila College - Gampaha Server running at http://localhost:${PORT}`);
});
