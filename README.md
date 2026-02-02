# 🛡️ TourioSafe – Integrated Tourism Safety & Experience Platform
![Node.js](https://img.shields.io/badge/Node.js-16.x+-green?style=for-the-badge&logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

A full-stack, comprehensive tourism ecosystem designed to redefine the Indian travel experience by prioritizing traveler safety, local discovery, and environmental sustainability. **TourioSafe** combines an intelligent itinerary planner, a location-aware safety chatbot, real-time SOS integration, and a localized "50+ State Page" ecosystem to provide a seamless and secure journey across India's diverse landscapes.

📹 **Project Demo**
[Project Demo Placeholder]

🌟 **Why TourioSafe?**
Indian tourism is often fragmented, with travelers facing challenges in accessing:
- Verified safety guidance for specific regions.
- Personalized itineraries that respect local nuances and budgets.
- Environmental impact transparency for their transit choices.

**TourioSafe solves this by providing:**
- ✅ **50+ Localized Guides** – Dedicated pages for every major state with curated pros/cons and attractions.
- ✅ **Smart Itinerary Builder** – Logic-driven 1-7 day trip generator based on budget and travel style.
- ✅ **Instant SOS Suite** – One-tap emergency alert system with GPS coordinate flash via SendGrid.
- ✅ **Safety Chatbot** – Custom AI guidance powered by a fuzzy-match PDF knowledge base.
- ✅ **Green Travel Hub** – IPCC-aligned carbon calculator with "Trees to Offset" actionable metrics.
- ✅ **Weighted Autocomplete** – Regional-proximity search for 2000+ airports, stations, and hotels.
- ✅ **Incident Reporting** – Secure persistence of traveler issues for community awareness and support.

🏗️ **System Architecture**
**Data Flow Pipeline**
User Input → Itinerary/Search Logic → Frontend Display → Database Persistence
    ↓                  ↓                     ↓                  ↓
Personalized      Weighted Search       Interactive UI     Secure Logging
      (JS Engine)       (Debounced)        (40+ CSS Themes)   (SQLite Storage)

**Component Breakdown**

🖥️ **Backend Server (Node.js)**
- **Location**: `server.js` + `db.js`
- **Technology**: Node.js, Express.js
- **Port**: 3000
- **Responsibilities**:
  - Secure REST APIs for Authentication (JWT) and User Profiles.
  - PDF Knowledge Retrieval for the SOS Chatbot using `pdf-parse`.
  - Emergency SOS Dispatch via SendGrid API.
  - Persistence management for Itinerary logs and Incident reports.

🗄️ **Database (SQLite)**
- **File**: `database.sqlite`
- **Tables**:
  - `users` – ID, username, password_hash, role.
  - `reports` – Incident details, location (lat/lon), attachments.
  - `search_logs` – History of travel/flight/hotel queries.
  - `carbon_footprint_calculations` – Mode of transport, CO2 data, and offsets.
  - `user_activity_log` – Audit trail of user interactions and IP/UserAgent.

🎨 **Frontend (Vanilla JavaScript & CSS)**
- **Main Modules**:
  - `main.js` – Core travel booking, navigation, and section rendering logic.
  - `itinerary-builder.js` – High-complexity engine for personalized trip generation.
  - `chatbot.js` – Class-based Safety Assistant with geolocation and offline detection.
  - `travel-autocomplete.js` – Weighted search algorithm for high-performance travel nodes.
- **50+ Specialized Pages**:
  - `andhrapradesh.html`, `goa.html`, `rajasthan.html`, etc.
  - Each with a dedicated CSS theme (e.g., `andhrapradesh.css`, `goa.css`).

✨ **Features**

🌍 **Core Functionality**
- **Hyper-Local Discovery** – 50+ state-specific modules with deep-dive guides.
- **Micro-animations** – Premium UI with smooth transitions and hover effects.
- **Adaptive Layouts** – Mobile-first design optimized for travelers on the go.

👤 **Safety & Accounts**
- **JWT-Based Security** – State-of-the-art token-based session management.
- **Incident Persistence** – Upload proofs (images/documents) using `multer` integration.
- **Emergency SOS** – Real-time coordinate capture and authorities notification.

### 🛡️ Women Safety Dashboard (Integrated Core)
A specialized, high-security dashboard (`dashboard.html`) designed for immediate protection and situational awareness.
- 📍 **Live Location Sharing** – Encrypted 30-minute location broadcasting with shareable links.
- 🚻 **Safe Washrooms Map** – Crowd-sourced and verified directory of women-friendly facilities.
- 🆘 **Silent SOS** – Discrete emergency activation notifying Police (100) and Women Helpline (1091).
- ⚠️ **Unsafe Spot Reporting** – Geotagged incident logging with multimedia attachment support.
- 🏥 **Safe Spot Finder** – Real-time proximity search for Hospitals, 24/7 Pharmacies, and Safe Cafes.
- 🔒 **Privacy-First Design** – Automatic data purging 30 minutes after session termination.

� **Data & Sustainability**
- **Eco-Analytics** – Calculates environmental impact and tree-planting equivalents.
- **Dynamic Itineraries** – Real-time adjustment of schedules based on user interests.
- **Weighted Search** – Prioritizes focal points like Muzaffarnagar and nearby airports.

🔌 **API Endpoints**

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| POST | `/auth/register` | User Registration | ❌ |
| POST | `/auth/login` | JWT Authentication | ❌ |
| POST | `/report` | File-based Incident Report | ✅ |
| POST | `/sos` | Emergency Email Dispatch | ❌ |
| POST | `/ask` | AI Safety Guidance (PDF Match) | ❌ |
| POST | `/api/green-travel/calculate-carbon` | CO2 & Offset Logic | ✅ |

🛠️ **Tech Stack**

**Frontend**
- HTML5, CSS3 (Glassmorphism), JavaScript (ES6+).
- Inter, Poppins (Modern Typography).

**Backend**
- Node.js, Express.js.
- bcryptjs (Hashing), jsonwebtoken (Auth), SendGrid (Email).

**Utilities**
- PDF-Parse (Knowledge Retrieval), Multer (File Storage).

📂 **Project Structure**
```
Turio-Safe/
├── public/                 # Frontend Ecosystem
│   ├── images/             # UI Assets & Logos
│   ├── js/                 # Modular JS Engines
│   ├── css/                # 40+ Localized Styles
│   ├── (50+ html files)     # State-specific discovery pages
│   └── dashboard.html      # Main User Hub
├── knowledge/              # Knowledge Base for Chatbot
│   └── knowledge.pdf       # Indexed Safety Manual
├── uploads/                # User Persistent Media
├── server.js               # Node.js API Entry Point
├── db.js                   # Promisified SQLite Logic
├── database.sqlite         # Core Data Store
└── .env                    # Environment Config (API Keys/Secrets)
```

🚀 **Quick Start**

**Prerequisites**
- Node.js 16.x or higher.
- SendGrid API Key (for SOS alerts).

**Installation**
1. **Clone & Enter**:
   ```bash
   git clone https://github.com/your-username/turio-safe.git
   cd turio-safe
   ```
2. **Install Backend**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` in the root:
   ```env
   SENDGRID_API_KEY=your_key
   JWT_SECRET=your_jwt_secret
   SENDER_EMAIL=your_verified_sender
   ```
4. **Launch Application**:
   ```bash
   node server.js
   ```
   *The server initializes SQLite tables automatically on the first run.*

5. **Access Hub**:
   Open `http://localhost:3000` in your browser.

📖 **Understanding Safety Levels**
| Level | Category | Health/Safety Advice |
| :---: | :--- | :--- |
| ✅ | Success | Normal travel precautions apply. |
| ⚠️ | Caution | Stay in well-lit public areas. |
| 🚨 | Danger | SOS Mode Active - Stay stationary for authorities. |

👤 **Author**
**Your Name**
Full-Stack Developer • Tourism Tech Enthusiast
[GitHub] [LinkedIn]

📝 **License**
This project is open-source and available under the **MIT License**.

---
*Empowering travelers to explore India safely, smartly, and sustainably.*
