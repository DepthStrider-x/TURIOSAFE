// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to database file
const dbFile = path.join(__dirname, 'database.sqlite');

// Create/connect database
const db = new sqlite3.Database(dbFile);
console.log("✅ Database connected at:", dbFile);

// Promisified wrappers
db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

db.getAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

db.allAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Helper function to log user activity
async function logUserActivity(userId, activityType, activityData = {}, ipAddress = null, userAgent = null) {
  const dataStr = JSON.stringify(activityData);
  await db.runAsync(`
    INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, activityType, dataStr, ipAddress, userAgent]);
}

// Helper function to save carbon footprint calculation
async function saveCarbonFootprint(userId, mode, distanceKm, co2Emissions, journeyDetails = {}) {
  const detailsStr = JSON.stringify(journeyDetails);
  await db.runAsync(`
    INSERT INTO carbon_footprint_calculations (user_id, mode_of_transport, distance_km, co2_emissions_g, journey_details)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, mode, distanceKm, co2Emissions, detailsStr]);
}

// Helper function to log search
async function logSearch(userId, searchType, searchData) {
  const fields = [
    userId, searchType,
    searchData.from, searchData.to,
    searchData.pickup, searchData.drop,
    searchData.dateFrom, searchData.dateTo,
    searchData.departure, searchData.return,
    searchData.travelers, searchData.classType,
    searchData.fareType, searchData.vehicleType,
    searchData.location,
    searchData.checkin, searchData.checkout,
    searchData.guests
  ];
  
  await db.runAsync(`
    INSERT INTO search_logs (
      user_id, search_type, from_location, to_location,
      pickup_location, drop_location, date_from, date_to,
      departure_date, return_date, travelers, class_type,
      fare_type, vehicle_type, location, checkin_date, checkout_date, guests
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, fields);
}

module.exports = db;

// Export helper functions
module.exports.logUserActivity = logUserActivity;
module.exports.saveCarbonFootprint = saveCarbonFootprint;
module.exports.logSearch = logSearch;