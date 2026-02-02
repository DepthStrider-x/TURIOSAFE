require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require("pdf-parse");
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());
// Load PDF knowledge at startup
let pdfText = "";
let pdfSections = {}; // In-memory index: {"section_key": "full_section_text"}
const knowledgePath = path.join(__dirname, "knowledge", "knowledge.pdf");

if (fs.existsSync(knowledgePath)) {
  try {
    const dataBuffer = fs.readFileSync(knowledgePath);
    pdf(dataBuffer)
      .then((data) => {
        pdfText = data.text;
        buildSectionsIndex(pdfText);
        console.log("PDF knowledge loaded and indexed!", Object.keys(pdfSections).length, "sections found");
      })
      .catch((err) => {
        console.error("Error parsing PDF:", err.message);
      });
  } catch (err) {
    console.error("Error reading PDF file:", err.message);
  }
} else {
  console.warn("knowledge.pdf not found. PDF answers disabled.");
}

// Build an in-memory index of sections from PDF text
function buildSectionsIndex(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let currentSection = null;
  let currentContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect section headers (lines starting with [ and ending with ])
    if (line.startsWith('[') && line.endsWith(']')) {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        const sectionKey = currentSection.toLowerCase().replace(/[\[\]]/g, '').trim();
        const sectionText = currentSection + '\n' + currentContent.join('\n');
        pdfSections[sectionKey] = sectionText;
      }
      
      // Start new section
      currentSection = line;
      currentContent = [];
    } else if (currentSection) {
      // Add content to current section (bullet points, instructions, etc.)
      currentContent.push(line);
    }
  }
  
  // Don't forget the last section
  if (currentSection && currentContent.length > 0) {
    const sectionKey = currentSection.toLowerCase().replace(/[\[\]]/g, '').trim();
    const sectionText = currentSection + '\n' + currentContent.join('\n');
    pdfSections[sectionKey] = sectionText;
  }
}

// Enhanced PDF search with fuzzy matching
function searchPDF(userMessage) {
  const query = userMessage.toLowerCase().trim();
  
  if (!pdfSections || Object.keys(pdfSections).length === 0) {
    return "PDF knowledge base not available. Please seek professional help.";
  }
  
  // 1. Direct keyword match in section keys
  for (const [sectionKey, sectionText] of Object.entries(pdfSections)) {
    const keywords = query.split(/\s+/);
    if (keywords.some(keyword => sectionKey.includes(keyword))) {
      return sectionText;
    }
  }
  
  // 2. Fuzzy match - check if query words appear in section key
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [sectionKey, sectionText] of Object.entries(pdfSections)) {
    const queryWords = query.split(/\s+/);
    const sectionWords = sectionKey.split(/\s+/);
    
    let matchScore = 0;
    for (const queryWord of queryWords) {
      for (const sectionWord of sectionWords) {
        if (sectionWord.includes(queryWord) || queryWord.includes(sectionWord)) {
          matchScore += 1;
        }
        // Partial match scoring
        if (queryWord.length > 3 && sectionWord.includes(queryWord.substring(0, 4))) {
          matchScore += 0.5;
        }
      }
    }
    
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = sectionText;
    }
  }
  
  // 3. If still no good match, search within section content
  if (!bestMatch || bestScore < 1) {
    for (const [sectionKey, sectionText] of Object.entries(pdfSections)) {
      if (sectionText.toLowerCase().includes(query)) {
        return sectionText;
      }
    }
  }
  
  return bestMatch || "Sorry, no guidance found for that. Please seek professional help.";
}

// Legacy function kept for compatibility
function searchPdfForAnswer(question) {
  return searchPDF(question);
}

app.post('/ask', (req, res) => {
  const { message, language = 'English', lat, lon } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Search PDF for relevant content
    const pdfAnswer = searchPDF(message);
    let reply = pdfAnswer;
    let tips = [];
    
    // Enhanced emergency detection
    const emergencyKeywords = ['help', 'emergency', 'sos', 'urgent', 'danger', 'scared', 'injured', 'lost', 'harassed', 'bleeding', 'pain', 'accident'];
    const isEmergency = emergencyKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (isEmergency) {
      reply = language === 'Hindi'
        ? '🚨 आपातकाल का पता चला! तुरंत मदद के लिए 112 डायल करें। यहां तत्काल मार्गदर्शन है: ' + pdfAnswer
        : language === 'Japanese' 
        ? '🚨 緊急事態を検出しました！即座に112に電話してください。緊急ガイダンス: ' + pdfAnswer
        : '🚨 Emergency detected! Call 112 immediately for help. Here\'s immediate guidance: ' + pdfAnswer;
      
      tips = [
        'Call 112 for immediate emergency help',
        'Stay calm and move to a safe location',
        'Share your location with emergency services',
        'Keep emergency numbers saved: Police-100, Ambulance-102, Women Helpline-1091'
      ];
    } else if (pdfAnswer === "Sorry, no guidance found for that. Please seek professional help." || !pdfAnswer.trim()) {
      // Fallback response when no PDF match
      reply = language === 'Hindi'
        ? 'नमस्ते! मैं आपका सुरक्षा सहायक हूं। मैं आपको यात्रा सुरक्षा, आपातकालीन सहायता और स्थानीय जानकारी में मदद कर सकता हूं।'
        : language === 'Japanese'
        ? 'こんにちは！私はあなたの安全アシスタントです。旅行の安全、緊急サポート、現地情報をサポートします。'
        : 'Hello! I\'m your Safety Assistant. I can help you with travel safety, emergency support, and local information. How can I assist you today?';
      
      tips = ['Type "help" for emergency assistance', 'Share location for nearby facilities', 'Ask about travel safety tips'];
    } else {
      // PDF content found, add helpful tips
      tips = ['Ask for more specific details', 'Type "help" for emergency assistance', 'Share location for local guidance'];
    }
    
    res.json({
      reply,
      tips,
      timestamp: new Date().toISOString(),
      language,
      location: lat && lon ? { lat, lon } : null
    });
    
  } catch (err) {
    console.error('Ask endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
const PORT = process.env.PORT || 3000;

if (!process.env.SENDGRID_API_KEY) {
  console.error('Missing SENDGRID_API_KEY');
  // don't exit here if you want to continue dev without sending emails
  // process.exit(1);
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve frontend
// make uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// serve uploads to frontend
app.use('/uploads', express.static(uploadDir));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'; // set in .env in production

// --- Helper: create tables if not exist (safe to run each start)
async function ensureTables() {
  try {
    // users table
    await db.runAsync(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // reports table (incident reports)
    await db.runAsync(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      location TEXT,
      type TEXT,
      description TEXT,
      attachment TEXT,
      lat REAL,
      lon REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // search_logs table
    await db.runAsync(`CREATE TABLE IF NOT EXISTS search_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      search_type TEXT NOT NULL,
      from_location TEXT,
      to_location TEXT,
      pickup_location TEXT,
      drop_location TEXT,
      date_from DATETIME,
      date_to DATETIME,
      departure_date DATETIME,
      return_date DATETIME,
      travelers INTEGER DEFAULT 1,
      class_type TEXT,
      fare_type TEXT,
      vehicle_type TEXT,
      location TEXT,
      checkin_date DATETIME,
      checkout_date DATETIME,
      guests INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // carbon_footprint_calculations table
    await db.runAsync(`CREATE TABLE IF NOT EXISTS carbon_footprint_calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      mode_of_transport TEXT NOT NULL,
      distance_km REAL NOT NULL,
      co2_emissions_g REAL NOT NULL,
      journey_details TEXT,
      calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // user_activity_log table
    await db.runAsync(`CREATE TABLE IF NOT EXISTS user_activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      activity_type TEXT NOT NULL,
      activity_data TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    console.log('✅ DB tables checked/created');
  } catch (err) {
    console.error('❌ Error creating tables', err);
  }
}
ensureTables();


// --- Auth endpoints
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'Username, email and password required' });
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.runAsync(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      [username, email, password_hash]
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ success: false, error: 'Missing credentials' });
  }
  try {
    const row = await db.getAsync(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [usernameOrEmail, usernameOrEmail]
    );
    if (!row) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = jwt.sign({ id: row.id, username: row.username, role: row.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Middleware to verify token
function verifyToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ success: false, error: 'No token provided' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ success: false, error: 'Invalid token format' });
  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: 'Invalid token' });
    req.user = decoded; // id, username, role
    next();
  });
}

// --- Reports endpoints (protected)
app.post('/report', verifyToken, upload.single('attachment'), async (req, res) => {
  const { name, location, type, description, lat, lon } = req.body;
  const userId = req.user.id;

  if (!name || !location || !type || !description) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const attachment = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await db.runAsync(
      `INSERT INTO reports (user_id, name, location, type, description, attachment, lat, lon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, location, type, description, attachment, lat || null, lon || null]
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Option: public reports (only non-sensitive fields) - or make protected
app.get('/reports', verifyToken, async (req, res) => {
  try {
    const rows = await db.allAsync(`SELECT r.*, u.username as reporter FROM reports r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC`);
    res.json({ success: true, reports: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SOS endpoint (keeps existing functionality)
app.post('/sos', async (req, res) => {
  const { lat, lon } = req.body;
  const msg = {
    to: process.env.SENDER_EMAIL,      // change to police/family later
    from: process.env.SENDER_EMAIL,
    subject: 'SOS Alert',
    html: `
      <h2>🚨 SOS Alert 🚨</h2>
      <p>I am in urgent need of help.</p>
      <p><b>📍 Location:</b>
         <a href="https://www.google.com/maps?q=${lat},${lon}">
           Click here to view location
         </a>
      </p>
      <p>Please respond immediately.</p>
    `
  };
  try {
    if (!process.env.SENDGRID_API_KEY) {
      // In dev, don't crash — just log and return success for now
      console.warn('SENDGRID_API_KEY missing. Skipping email.');
      return res.json({ success: true, info: 'Email skipped (no API key)' });
    }
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Safety-Assistant Chatbot API endpoint
app.post('/api/chat', async (req, res) => {
  const { message, language = 'English', lat, lon } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  try {
    // Convert message to lowercase for keyword detection
    const lowerMessage = message.toLowerCase();
    
    // Safety keywords detection
    const safetyKeywords = ['help', 'sos', 'emergency', 'lost', 'harassed', 'injured', 'danger', 
                           'unsafe', 'scared', 'threat', 'attack', 'trouble', 'urgent', 'police'];
    
    const containsSafetyKeyword = safetyKeywords.some(keyword => lowerMessage.includes(keyword));
    
    let reply, tips;
    
    if (containsSafetyKeyword) {
      // Emergency response
      reply = language === 'Hindi' 
        ? 'तुरंत सहायता मिल रही है! नजदीकी पुलिस स्टेशन: XYZ - 📞 123456789'
        : language === 'Japanese'
        ? '緊急支援が来ています！最寄りの警察署：XYZ - 📞 123456789'
        : 'Emergency assistance is coming! Nearest police station: XYZ Police Station - 📞 123456789';
      
      tips = language === 'Hindi'
        ? ['सुरक्षित स्थान पर जाएं', 'तुरंत 112 पर कॉल करें', 'अपना स्थान साझा करें']
        : language === 'Japanese'
        ? ['安全な場所に移動してください', '112に電話してください', '位置情報を共有してください']
        : ['Move to a safe public place immediately', 'Call 112 (emergency) right now', 'Share your location with trusted contacts'];
    } else if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('direction')) {
      // Location-based queries
      reply = lat && lon 
        ? `Based on your location (${lat}, ${lon}), here are nearby facilities: Police Station (2km), Hospital (1.5km), Tourist Help Center (500m)`
        : 'Please share your location for personalized assistance. I can help you find nearby police stations, hospitals, and safe places.';
      
      tips = ['Always inform someone about your travel plans', 'Keep emergency contacts handy', 'Use official transportation'];
    } else if (lowerMessage.includes('travel') || lowerMessage.includes('safe') || lowerMessage.includes('tip')) {
      // General travel safety
      reply = 'Here are some important travel safety tips for your journey in India:';
      tips = [
        'Keep copies of important documents',
        'Avoid displaying expensive items',
        'Use registered transport services',
        'Stay in well-lit areas at night',
        'Keep emergency numbers saved: Police-100, Ambulance-102, Women Helpline-1091'
      ];
    } else {
      // General chatbot response
      reply = language === 'Hindi'
        ? 'नमस्ते! मैं आपका सुरक्षा सहायक हूं। मैं आपको यात्रा सुरक्षा, आपातकालीन सहायता और स्थानीय जानकारी में मदद कर सकता हूं।'
        : language === 'Japanese'
        ? 'こんにちは！私はあなたの安全アシスタントです。旅行の安全、緊急サポート、現地情報をサポートします。'
        : 'Hello! I\'m your Safety Assistant. I can help you with travel safety, emergency support, and local information. How can I assist you today?';
      
      tips = ['Type "help" for emergency assistance', 'Share location for nearby facilities', 'Ask about travel safety tips'];
    }
    
    // TODO: Replace with real database queries
    // Example: const nearbyPoliceStations = await db.allAsync('SELECT * FROM police_stations WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?', [lat-0.01, lat+0.01, lon-0.01, lon+0.01]);
    
    // TODO: Add PDF/knowledge-base integration here
    // Example: const safetyGuides = await searchKnowledgeBase(message, language);
    
    res.json({
      success: true,
      reply,
      tips,
      timestamp: new Date().toISOString(),
      language,
      location: lat && lon ? { lat, lon } : null
    });
    
  } catch (err) {
    console.error('Chat API error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// New chatbot endpoint
app.post("/send-message", (req, res) => {
  const userMessage = req.body.message;
  const reply = searchPDF(userMessage);
  res.json({ reply });
});

// === Travel Booking API Endpoints ===

// Helper to extract IP and User Agent
function getRequestMeta(req) {
  return {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };
}

// POST /api/flights/search
app.post('/api/flights/search', verifyToken, async (req, res) => {
  const { from, to, departure, return: ret, travelers, fareType } = req.body;
  const userId = req.user?.id || null;
  const { ip, userAgent } = getRequestMeta(req);

  try {
    // Log search
    await db.runAsync(`
      INSERT INTO search_logs (user_id, search_type, from_location, to_location, departure_date, return_date, travelers, fare_type)
      VALUES (?, 'flight', ?, ?, ?, ?, ?, ?)
    `, [userId, from, to, departure, ret, travelers, fareType]);

    // Log activity
    await db.runAsync(`
      INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
      VALUES (?, 'search', ?, ?, ?)
    `, [userId, JSON.stringify({type: 'flight', from, to}), ip, userAgent]);

    // Mock response - in production, integrate with flight APIs or generate redirect
    const mockResults = [
      { airline: 'Air India', flightNumber: 'AI123', departure: '08:00', arrival: '10:30', price: 5000, currency: 'INR' },
      { airline: 'IndiGo', flightNumber: '6E456', departure: '12:00', arrival: '14:30', price: 4500, currency: 'INR' }
    ];

    res.json({ success: true, results: mockResults });
  } catch (err) {
    console.error('Flight search error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/trains/search
app.post('/api/trains/search', verifyToken, async (req, res) => {
  const { from, to, date, class: cls, travelers } = req.body;
  const userId = req.user?.id || null;
  const { ip, userAgent } = getRequestMeta(req);

  try {
    await db.runAsync(`
      INSERT INTO search_logs (user_id, search_type, from_location, to_location, date_from, class_type, travelers)
      VALUES (?, 'train', ?, ?, ?, ?, ?)
    `, [userId, from, to, date, cls, travelers]);

    await db.runAsync(`
      INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
      VALUES (?, 'search', ?, ?, ?)
    `, [userId, JSON.stringify({type: 'train', from, to}), ip, userAgent]);

    // Generate IRCTC redirect link with pre-filled params
    const irctcLink = `https://www.irctc.co.in/nget/train-search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&quota=GN&class=${cls}`;

    res.json({ success: true, redirectUrl: irctcLink });
  } catch (err) {
    console.error('Train search error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/buses/search
app.post('/api/buses/search', verifyToken, async (req, res) => {
  const { from, to, date, type } = req.body;
  const userId = req.user?.id || null;
  const { ip, userAgent } = getRequestMeta(req);

  try {
    await db.runAsync(`
      INSERT INTO search_logs (user_id, search_type, from_location, to_location, date_from, vehicle_type)
      VALUES (?, 'bus', ?, ?, ?, ?)
    `, [userId, from, to, date, type]);

    await db.runAsync(`
      INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
      VALUES (?, 'search', ?, ?, ?)
    `, [userId, JSON.stringify({type: 'bus', from, to}), ip, userAgent]);

    // Redirect to redBus with params
    const redBusLink = `https://www.redbus.in/bus-tickets/${from.toLowerCase().replace(/ /g, '-')}-to-${to.toLowerCase().replace(/ /g, '-')}?date=${date}`;

    res.json({ success: true, redirectUrl: redBusLink });
  } catch (err) {
    console.error('Bus search error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/cabs/search
app.post('/api/cabs/search', verifyToken, async (req, res) => {
  const { pickup, drop, datetime, type } = req.body;
  const userId = req.user?.id || null;
  const { ip, userAgent } = getRequestMeta(req);

  try {
    await db.runAsync(`
      INSERT INTO search_logs (user_id, search_type, pickup_location, drop_location, departure_date, vehicle_type)
      VALUES (?, 'cab', ?, ?, ?, ?)
    `, [userId, pickup, drop, datetime, type]);

    await db.runAsync(`
      INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
      VALUES (?, 'search', ?, ?, ?)
    `, [userId, JSON.stringify({type: 'cab', pickup, drop}), ip, userAgent]);

    // Return Ola/Uber deep links
    const olaLink = `ola://book?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}&datetime=${datetime}&car_type=${type}`;
    const uberLink = `uber://?action=setPickup&pickup[latitude]=&pickup[longitude]=&dropoff[latitude]=&dropoff[longitude]=&product_id=${type}`; // simplified

    res.json({ success: true, olaLink, uberLink });
  } catch (err) {
    console.error('Cab search error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/accommodations/search
app.post('/api/accommodations/search', verifyToken, async (req, res) => {
  const { location, checkin, checkout, guests } = req.body;
  const userId = req.user?.id || null;
  const { ip, userAgent } = getRequestMeta(req);

  try {
    await db.runAsync(`
      INSERT INTO search_logs (user_id, search_type, location, checkin_date, checkout_date, guests)
      VALUES (?, 'accommodation', ?, ?, ?, ?)
    `, [userId, location, checkin, checkout, guests]);

    await db.runAsync(`
      INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
      VALUES (?, 'search', ?, ?, ?)
    `, [userId, JSON.stringify({type: 'accommodation', location}), ip, userAgent]);

    // Redirect to MakeMyTrip
    const mmtLink = `https://www.makemytrip.com/hotels/search?city=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&guest=${guests}`;

    res.json({ success: true, redirectUrl: mmtLink });
  } catch (err) {
    console.error('Accommodation search error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/green-travel/calculate-carbon
app.post('/api/green-travel/calculate-carbon', verifyToken, async (req, res) => {
  const { mode, distance_km, details } = req.body;
  const userId = req.user?.id || null;
  const { ip, userAgent } = getRequestMeta(req);

  // Enhanced emission factors in g CO2e per km (updated with latest IPCC data)
  const emissionFactors = {
    'walking': 0,
    'cycling': 30, // includes manufacturing and food energy
    'electric_car': 47, // includes electricity generation emissions
    'bus': 85, // average occupancy
    'train': 35, // electric trains
    'domestic_flight': 246, // short-haul flights
    'long_haul_flight': 173, // long-haul flights (more efficient per km)
    'car': 170 // average petrol/diesel car
  };

  const factor = emissionFactors[mode] || 0;
  const co2Emissions = factor * distance_km;
  
  // Calculate additional environmental metrics
  const treesToPlant = Math.max(1, Math.ceil(co2Emissions / 1000 / 22)); // Trees needed to offset (22kg/tree/year)
  const fuelConsumption = calculateFuelConsumption(mode, distance_km);
  const airQualityImpact = calculateAirQualityImpact(mode, distance_km);
  const offsetCost = Math.round(co2Emissions / 1000 * 400); // ₹400 per ton CO2 in India

  try {
    // Enhanced journey details
    const enhancedDetails = {
      ...details,
      treesToPlant,
      fuelConsumption,
      airQualityImpact,
      offsetCost,
      calculatedAt: new Date().toISOString(),
      emissionFactor: factor
    };

    // Save calculation with enhanced data
    await db.runAsync(`
      INSERT INTO carbon_footprint_calculations (user_id, mode_of_transport, distance_km, co2_emissions_g, journey_details)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, mode, distance_km, co2Emissions, JSON.stringify(enhancedDetails)]);

    await db.runAsync(`
      INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
      VALUES (?, 'carbon_calculate', ?, ?, ?)
    `, [userId, JSON.stringify({mode, distance_km, co2Emissions, treesToPlant}), ip, userAgent]);

    res.json({ 
      success: true, 
      mode,
      distance_km,
      co2_emissions_g: co2Emissions,
      co2_emissions_kg: Math.round(co2Emissions / 1000 * 100) / 100,
      trees_to_plant: treesToPlant,
      fuel_consumption: fuelConsumption,
      air_quality_impact: airQualityImpact,
      offset_cost_inr: offsetCost,
      emission_factor: factor,
      environmental_message: generateEnvironmentalMessage(mode, co2Emissions, treesToPlant),
      message: `Your journey will emit approximately ${Math.round(co2Emissions)} grams of CO2. Plant ${treesToPlant} tree(s) to offset this impact.`
    });
  } catch (err) {
    console.error('Carbon calculation error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Helper functions for enhanced carbon calculations
function calculateFuelConsumption(mode, distance) {
  const fuelRates = {
    'walking': { amount: 0, unit: 'liters', type: 'No fuel consumption' },
    'cycling': { amount: 0, unit: 'liters', type: 'No fuel consumption' },
    'electric_car': { amount: Math.round(distance * 0.15 * 100) / 100, unit: 'kWh', type: 'Electricity' },
    'bus': { amount: Math.round(distance * 0.02 * 100) / 100, unit: 'liters/person', type: 'Diesel (shared)' },
    'train': { amount: Math.round(distance * 0.01 * 100) / 100, unit: 'liters equivalent/person', type: 'Electricity/Diesel' },
    'car': { amount: Math.round(distance * 0.08 * 100) / 100, unit: 'liters', type: 'Petrol/Diesel' },
    'domestic_flight': { amount: Math.round(distance * 0.15 * 100) / 100, unit: 'liters', type: 'Jet fuel' },
    'long_haul_flight': { amount: Math.round(distance * 0.12 * 100) / 100, unit: 'liters', type: 'Jet fuel' }
  };
  
  return fuelRates[mode] || { amount: 0, unit: 'unknown', type: 'Unknown' };
}

function calculateAirQualityImpact(mode, distance) {
  // Air pollutants in grams (NOx, PM2.5, SO2)
  const pollutionFactors = {
    'walking': { nox: 0, pm25: 0, so2: 0, message: 'Zero air pollution' },
    'cycling': { nox: 0, pm25: 0, so2: 0, message: 'Zero air pollution' },
    'electric_car': { nox: 0, pm25: 0.1, so2: 0.05, message: 'Low air pollution (from electricity generation)' },
    'bus': { nox: 2.5, pm25: 0.2, so2: 0.1, message: 'Moderate pollution, but shared impact' },
    'train': { nox: 0.8, pm25: 0.05, so2: 0.03, message: 'Low pollution per passenger' },
    'car': { nox: 3.2, pm25: 0.3, so2: 0.15, message: 'Significant local air pollution' },
    'domestic_flight': { nox: 8.5, pm25: 0.5, so2: 0.25, message: 'High altitude emissions' },
    'long_haul_flight': { nox: 6.8, pm25: 0.4, so2: 0.2, message: 'High altitude emissions' }
  };
  
  const factors = pollutionFactors[mode] || pollutionFactors.car;
  return {
    nox_grams: Math.round(factors.nox * distance / 10) / 10,
    pm25_grams: Math.round(factors.pm25 * distance / 10) / 10,
    so2_grams: Math.round(factors.so2 * distance / 10) / 10,
    message: factors.message
  };
}

function generateEnvironmentalMessage(mode, emissions, trees) {
  const emissionsKg = emissions / 1000;
  
  if (emissionsKg === 0) {
    return "🌱 Excellent choice! Zero carbon emissions. You're helping save the planet!";
  } else if (emissionsKg < 5) {
    return `🌿 Low carbon impact! Plant ${trees} tree(s) and you'll be carbon positive.`;
  } else if (emissionsKg < 15) {
    return `🌳 Moderate impact. Consider planting ${trees} tree(s) to offset your emissions.`;
  } else if (emissionsKg < 50) {
    return `⚠️ Higher carbon impact. Plant ${trees} tree(s) and consider greener alternatives next time.`;
  } else {
    return `🚨 Very high impact! Please plant ${trees} tree(s) and strongly consider alternatives like trains.`;
  }
}

// GET /api/green-travel/eco-tips
app.get('/api/green-travel/eco-tips', (req, res) => {
  const tips = [
    "Prefer trains over flights for medium-distance travel to reduce emissions by 80%.",
    "Choose direct flights to reduce takeoff/landing emissions which account for 25% of flight emissions.",
    "Pack light to reduce fuel consumption - every 10kg saves 150g CO₂ on flights.",
    "Use public transportation or walk when arriving at your destination.",
    "Stay in eco-certified hotels that use renewable energy and water conservation.",
    "Support local businesses and eat locally-sourced food to reduce transport emissions.",
    "Avoid single-use plastics; carry a reusable water bottle and shopping bags.",
    "Offset your carbon footprint through verified programs like Gold Standard or VCS.",
    "Travel off-season to reduce strain on popular destinations and get better deals.",
    "Choose group tours to share transport emissions among multiple travelers.",
    "Plant native trees - they absorb 22kg CO₂ annually and support local ecosystems.",
    "Use electric or hybrid vehicles for city travel to reduce urban air pollution.",
    "Book accommodation near your activities to reduce local transportation needs.",
    "Choose trains with renewable energy - Indian Railways is increasing solar power usage.",
    "Participate in local conservation activities during your travels."
  ];
  res.json({ success: true, tips });
});

// GET /api/green-travel/user-history - Get user's carbon footprint history
app.get('/api/green-travel/user-history', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;

  try {
    const calculations = await db.allAsync(`
      SELECT * FROM carbon_footprint_calculations 
      WHERE user_id = ? 
      ORDER BY calculated_at DESC 
      LIMIT ?
    `, [userId, parseInt(limit)]);

    const totalEmissions = await db.getAsync(`
      SELECT 
        SUM(co2_emissions_g) as total_co2_g,
        COUNT(*) as total_trips,
        AVG(co2_emissions_g) as avg_co2_g
      FROM carbon_footprint_calculations 
      WHERE user_id = ?
    `, [userId]);

    const treesNeeded = Math.ceil((totalEmissions.total_co2_g || 0) / 1000 / 22);

    res.json({
      success: true,
      calculations: calculations.map(calc => ({
        ...calc,
        journey_details: JSON.parse(calc.journey_details || '{}')
      })),
      summary: {
        total_co2_kg: Math.round((totalEmissions.total_co2_g || 0) / 1000 * 100) / 100,
        total_trips: totalEmissions.total_trips || 0,
        avg_co2_kg: Math.round((totalEmissions.avg_co2_g || 0) / 1000 * 100) / 100,
        trees_needed_to_offset: treesNeeded,
        offset_cost_inr: Math.round(treesNeeded * 50) // ₹50 per tree planting cost
      }
    });
  } catch (err) {
    console.error('User history error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/green-travel/environmental-facts - Get random environmental facts
app.get('/api/green-travel/environmental-facts', (req, res) => {
  const facts = [
    {
      category: "Trees",
      fact: "A single mature tree absorbs 22kg of CO₂ per year and produces enough oxygen for 2 people.",
      action: "Plant native trees in your area"
    },
    {
      category: "Transportation",
      fact: "Trains emit 76% less CO₂ than flights for the same distance in India.",
      action: "Choose trains for distances under 1000km"
    },
    {
      category: "Air Quality",
      fact: "Transportation accounts for 24% of energy-related CO₂ emissions globally.",
      action: "Use public transport or electric vehicles"
    },
    {
      category: "Carbon Offset",
      fact: "1 ton of CO₂ can be offset by planting 45 tree saplings in India.",
      action: "Calculate and offset your annual travel emissions"
    },
    {
      category: "Wildlife",
      fact: "Transportation infrastructure affects 25% of wildlife habitats globally.",
      action: "Support eco-tourism that funds conservation"
    },
    {
      category: "Energy",
      fact: "Electric vehicles in India emit 60% less CO₂ than petrol cars (including electricity generation).",
      action: "Consider electric vehicles for your next car purchase"
    },
    {
      category: "Aviation",
      fact: "Aviation contributes 2.5% to global CO₂ emissions but 3.5% to warming due to high-altitude effects.",
      action: "Offset flight emissions through verified programs"
    },
    {
      category: "Ocean",
      fact: "Oceans absorb 30% of human-produced CO₂, but this causes ocean acidification.",
      action: "Reduce emissions to protect marine ecosystems"
    }
  ];

  // Return 3 random facts
  const randomFacts = facts.sort(() => 0.5 - Math.random()).slice(0, 3);
  res.json({ success: true, facts: randomFacts });
});

// GET /api/green-travel/tree-planting-locations - Get tree planting locations in India
app.get('/api/green-travel/tree-planting-locations', (req, res) => {
  const { state } = req.query;
  
  const locations = {
    "Maharashtra": [
      { name: "Aarey Forest, Mumbai", organization: "Mumbai Municipal Corporation", contact: "+91-22-2267-1000" },
      { name: "Sanjay Gandhi National Park", organization: "Forest Department Maharashtra", contact: "+91-22-2886-0389" }
    ],
    "Delhi": [
      { name: "Yamuna Biodiversity Park", organization: "Delhi Development Authority", contact: "+91-11-2371-0394" },
      { name: "Asola Bhatti Wildlife Sanctuary", organization: "Delhi Forest Department", contact: "+91-11-2680-4205" }
    ],
    "Karnataka": [
      { name: "Bannerghatta National Park", organization: "Karnataka Forest Department", contact: "+91-80-2783-1901" },
      { name: "Cubbon Park, Bangalore", organization: "BBMP", contact: "+91-80-2266-0018" }
    ],
    "Tamil Nadu": [
      { name: "Guindy National Park, Chennai", organization: "Tamil Nadu Forest Department", contact: "+91-44-2432-1471" },
      { name: "Nilgiri Hills", organization: "Tamil Nadu Forest Department", contact: "+91-423-244-4059" }
    ],
    "All": [
      { name: "Grow Billion Trees Foundation", organization: "National NGO", website: "growbilliontrees.com", type: "Online tree planting with GPS tracking" },
      { name: "Isha Foundation - Cauvery Calling", organization: "Environmental NGO", website: "cauverycalling.org", type: "River revitalization" },
      { name: "Green India Challenge", organization: "Government Initiative", website: "greenindiachallenge.in", type: "Mass tree plantation" }
    ]
  };

  const result = state ? (locations[state] || []) : locations.All;
  res.json({ success: true, locations: result });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));