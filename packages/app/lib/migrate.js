const { betterAuth } = require('better-auth');
const { auth } = require('./auth');

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    const authInstance = betterAuth(auth);

    // The migrate method should be available on the auth instance
    if (authInstance.migrate) {
      await authInstance.migrate();
      console.log('Migrations completed successfully!');
    } else {
      console.log('Migration method not found, skipping migrations...');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't exit with error code to allow app to start
    console.log('Starting application anyway...');
  }
}

runMigrations();
