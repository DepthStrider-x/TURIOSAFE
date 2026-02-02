const db = require('./db');

async function migrate() {
  try {
    await db.runAsync(`ALTER TABLE reports ADD COLUMN location TEXT`);
    await db.runAsync(`ALTER TABLE reports ADD COLUMN type TEXT`);
    await db.runAsync(`ALTER TABLE reports ADD COLUMN attachment TEXT`);
    console.log('✅ Migration applied: location, type, attachment added to reports');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('⚠️ Columns already exist, skipping...');
      process.exit(0);
    } else {
      console.error('❌ Migration error:', err);
      process.exit(1);
    }
  }
}

migrate();