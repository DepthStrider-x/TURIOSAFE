// migrate.js
const db = require('./db');

async function migrate() {
  try {
    // users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // reports table (incident reports)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        description TEXT,
        lat REAL,
        lon REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

        // search_logs table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS search_logs (
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
      )
    `);

    // carbon_footprint_calculations table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS carbon_footprint_calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT NULL,
        mode_of_transport TEXT NOT NULL,
        distance_km REAL NOT NULL,
        co2_emissions_g REAL NOT NULL,
        journey_details TEXT,
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // user_activity_log table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT NULL,
        activity_type TEXT NOT NULL,
        activity_data TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    console.log('Migrations applied');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();