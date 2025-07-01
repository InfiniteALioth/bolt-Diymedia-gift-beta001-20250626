import { connectDatabase } from '@/config/database';
import { logger } from '@/utils/logger';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    await connectDatabase();
    
    logger.info('Database migrations completed successfully');
    console.log('Database migrations completed successfully!');
    
  } catch (error) {
    logger.error('Database migration failed:', error);
    console.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigrations();