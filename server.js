import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import testDbHandler from './api/test-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001; // use 3001 to avoid conflicting with Vite's port 3000

// Increase body parsing limit for large JustDial JSON uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets from 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/test-db', async (req, res) => {
  try {
    await testDbHandler(req, res);
  } catch (err) {
    console.error("Error executing handler api/test-db:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kakinada Scraper API Cache
let scrapeStatus = {
  running: false,
  source: null,
  log: "",
  error: null
};

// API route to trigger scraper
app.post('/api/scrape/run', (req, res) => {
  const { source } = req.body; // 'google' or 'merge'
  if (scrapeStatus.running) {
    return res.status(400).json({ success: false, message: "Scraper is already running." });
  }
  
  scrapeStatus.running = true;
  scrapeStatus.source = source;
  scrapeStatus.log = `[Node Server] Starting ${source} scraper...\n`;
  scrapeStatus.error = null;
  
  const cmd = source === 'google' 
    ? 'python main.py --reset --google-only' 
    : 'python main.py --merge-only';
    
  const cwd = path.join(__dirname, 'kakinada-scraper');
  
  exec(cmd, { cwd }, (err, stdout, stderr) => {
    scrapeStatus.running = false;
    if (err) {
      scrapeStatus.error = err.message;
      scrapeStatus.log += `\n[Error] ${err.message}\n${stderr}`;
      console.error(`Scraper error: ${err.message}`);
    } else {
      scrapeStatus.log += `\n[Success] Scraper completed successfully!\n${stdout}`;
      console.log(`Scraper completed successfully.`);
    }
  });
  
  res.json({ success: true, message: `Scraper ${source} started in background.` });
});

// API route to get scraper status
app.get('/api/scrape/status', (req, res) => {
  const googleStateFile = path.join(__dirname, 'kakinada-scraper', 'output', 'logs', 'google_web_state.json');
  const jdStateFile = path.join(__dirname, 'kakinada-scraper', 'output', 'logs', 'kakinada_jewellery_jd_state.json');
  
  let googleState = { completed: false, results_count: 0 };
  let jdState = { completed: false, results_count: 0 };
  
  try {
    if (fs.existsSync(googleStateFile)) {
      googleState = JSON.parse(fs.readFileSync(googleStateFile, 'utf-8'));
    }
    if (fs.existsSync(jdStateFile)) {
      jdState = JSON.parse(fs.readFileSync(jdStateFile, 'utf-8'));
    }
  } catch (e) {}
  
  res.json({
    running: scrapeStatus.running,
    source: scrapeStatus.source,
    log: scrapeStatus.log,
    error: scrapeStatus.error,
    googleState,
    jdState
  });
});

// API route to save uploaded JustDial JSON file
app.post('/api/scrape/upload-jd', (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, message: "No data received." });
  }
  
  const outputDir = path.join(__dirname, 'kakinada-scraper', 'output', 'raw', 'justdial');
  fs.mkdirSync(outputDir, { recursive: true });
  
  const outputFile = path.join(outputDir, 'raw_jd_page_1_html.json');
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
  
  // Set jd state as completed
  const stateFile = path.join(__dirname, 'kakinada-scraper', 'output', 'logs', 'kakinada_jewellery_jd_state.json');
  const resultsCount = data.results ? data.results.length : 0;
  fs.writeFileSync(stateFile, JSON.stringify({ completed: true, results_count: resultsCount }, null, 2), 'utf-8');
  
  res.json({ success: true, message: "JustDial dataset uploaded successfully.", count: resultsCount });
});

// API route to get final merged listings
app.get('/api/scrape/results', (req, res) => {
  const resultsFile = path.join(__dirname, 'kakinada-scraper', 'output', 'merged', 'kakinada_jewellery', 'kakinada_jewellery_merged.json');
  if (!fs.existsSync(resultsFile)) {
    return res.json({ success: false, message: "No results found. Run merge first." });
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// For clean URLs (routing index.html for undefined paths)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log("\n=======================================================");
  console.log(`🚀 Yantriksha_X_Hub LOCAL DEVELOPMENT SERVER IS LIVE!`);
  console.log(`👉 Access URL: http://localhost:${port}`);
  console.log("=======================================================\n");
});
