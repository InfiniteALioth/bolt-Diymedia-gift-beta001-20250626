import bcrypt from 'bcryptjs';
import { connectDatabase } from '@/config/database';
import { Admin } from '@/models';
import { logger } from '@/utils/logger';

async function createSuperAdmin() {
  try {
    await connectDatabase();
    
    const username = 'superadmin';
    const password = 'admin123';
    const email = 'admin@example.com';
    
    // 检查是否已存在
    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      logger.info('Super admin already exists');
      return;
    }
    
    // 创建超级管理员
    const passwordHash = await bcrypt.hash(password, 12);
    
    const admin = await Admin.create({
      username,
      email,
      passwordHash,
      level: 1,
      permissions: {
        canCreateAdmins: true,
        canManagePages: true,
        canManageUsers: true,
        canManageMedia: true,
        canViewAnalytics: true,
      },
      isActive: true,
      createdBy: 'system',
    });
    
    logger.info(`Super admin created: ${admin.username}`);
    console.log('Super admin created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    logger.error('Failed to create super admin:', error);
    console.error('Failed to create super admin:', error);
  } finally {
    process.exit(0);
  }
}

createSuperAdmin();