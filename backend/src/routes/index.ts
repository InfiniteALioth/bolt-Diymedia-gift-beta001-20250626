// 路由入口文件
import { Router } from 'express';
import authRoutes from './auth';
import pageRoutes from './pages';
import mediaRoutes from './media';
import chatRoutes from './chat';
import userRoutes from './users';
import uploadRoutes from './upload';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/pages', pageRoutes);
router.use('/media', mediaRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;