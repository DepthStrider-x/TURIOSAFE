# Travel Booking UI Design Notes

## Overview
This document outlines the design and implementation plan for a travel booking UI similar to "Incredible India", built as a single-page application (SPA) using vanilla JavaScript, HTML, CSS, and Node.js with SQLite3.

The UI will support dynamic section switching between:
- Flights
- Trains
- Buses
- Cabs
- Accommodations
- Travel Partners
- Green Travel (new)

All frontend assets must use existing files: `index.html`, `style.css`, `main.js`, `script2.js`.

Backend updates will be made to:
- `db.js`
- `server.js`
- `migrate.js`

---

## Carbon Emission Factors (g CO2e/km)
Based on UK Government DESNZ and Our World in Data:

| Mode | g CO2e/km |
|------|-----------|
| Walking | 0 |
| Cycling | 16-50* |
| Electric Car | 47 |
| Bus (Transit) | 85 |
| Rail (National) | 35 |
| Domestic Flight | 246 |
| Long-Haul Flight | 173 |
| Car (Petrol/Diesel) | 170 |

*Cycling varies based on diet; average assumed ~30g/km

Source: https://ourworldindata.org/travel-carbon-footprint

---

## Database Schema Additions

### Table: search_logs
Stores user search queries across all travel modes.

```sql
CREATE TABLE IF NOT EXISTS search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT NULL,
  search_type TEXT NOT NULL, -- 'flight', 'train', 'bus', 'cab', 'accommodation'
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
  location TEXT, -- for accommodations
  checkin_date DATETIME,
  checkout_date DATETIME,
  guests INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Table: carbon_footprint_calculations
Stores results of carbon footprint calculations.

```sql
CREATE TABLE IF NOT EXISTS carbon_footprint_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT NULL,
  mode_of_transport TEXT NOT NULL, -- 'flight', 'train', 'bus', 'car', 'walking', 'cycling'
  distance_km REAL NOT NULL,
  co2_emissions_g REAL NOT NULL,
  journey_details TEXT, -- JSON string with full trip info
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Table: user_activity_log
General logging of user actions for analytics.

```sql
CREATE TABLE IF NOT EXISTS user_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT NULL,
  activity_type TEXT NOT NULL, -- 'search', 'carbon_calculate', 'page_view', 'redirect'
  activity_data TEXT, -- JSON payload
  ip_address TEXT,
  user_agent TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## API Endpoints

### POST /api/flights/search
- Expects: { from, to, departure, return, travelers, fareType }
- Logs to search_logs + user_activity_log
- Returns mock data or redirect link to IRCTC/MakeMyTrip/etc.

### POST /api/trains/search
- Expects: { from, to, date, class, travelers }
- Logs to search_logs + user_activity_log
- Returns redirect link to IRCTC with pre-filled params

### POST /api/buses/search
- Expects: { from, to, date, type }
- Logs to search_logs + user_activity_log
- Returns redirect link to redBus/TSRTC/etc.

### POST /api/cabs/search
- Expects: { pickup, drop, datetime, type }
- Logs to search_logs + user_activity_log
- Returns deep link to Ola/Uber app or web

### POST /api/accommodations/search
- Expects: { location, checkin, checkout, guests }
- Logs to search_logs + user_activity_log
- Returns redirect to MakeMyTrip/Booking.com

### POST /api/green-travel/calculate-carbon
- Expects: { mode, distance_km, [details] }
- Saves to carbon_footprint_calculations
- Returns estimated CO2 emissions in grams

### GET /api/green-travel/eco-tips
- Returns list of eco-friendly travel tips

---

## Frontend Architecture

### index.html
- Navigation bar with buttons for each section
- Dynamic content container (`<div id="dynamic-content">`)
- Shared styles via `style.css`

### style.css
- Responsive grid layout
- Smooth transitions and hover effects
- Mobile-first media queries
- Consistent color scheme and typography

### main.js
- Handles navigation click events
- Manages dynamic form rendering
- Calls backend APIs
- Handles redirection logic

### script2.js
- Animations: fade-in/out, slide transitions
- Loading spinners during API calls
- Dropdown interactions
- Modal handling if needed

---

## Green Travel Section

### Features
1. **Carbon Footprint Calculator**
   - Input: mode, distance (km)
   - Output: CO2 emissions estimate
   - Visual comparison (e.g., "This equals X trees")

2. **Eco Tips**
   - Reduce luggage weight
   - Prefer trains over flights
   - Use public transport
   - Stay in eco-certified hotels
   - Support local communities

3. **Eco-Friendly Destinations**
   - Highlight sustainable tourism spots
   - Show nearby green attractions

---

## Security & Privacy
- All user logs anonymized where possible
- No personal data stored without consent
- Secure JWT authentication for logged-in users
- Prepared SQL statements to prevent injection

---

## Next Steps
1. Update `migrate.js` with new table schemas ✅
2. Enhance `db.js` with helper functions
3. Extend `server.js` with new API routes
4. Redesign `index.html` navigation and content area
5. Style UI with modern responsive design
6. Implement SPA logic in `main.js`
7. Add animations in `script2.js`
8. Build Green Travel section
9. Test end-to-end flow