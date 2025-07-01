import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '@/models';
import { JwtPayload, SocketUser } from '@/types';
import { logger } from '@/utils/logger';

const connectedUsers = new Map<string, SocketUser>();

export const initializeSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      if (decoded.type !== 'user') {
        return next(new Error('Invalid token type'));
      }

      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`User connected: ${user.username} (${socket.id})`);

    // Handle joining a page room
    socket.on('join-page', (pageId: string) => {
      socket.join(pageId);
      
      const socketUser: SocketUser = {
        id: user.id,
        username: user.username,
        pageId,
        socketId: socket.id,
        joinedAt: new Date(),
      };
      
      connectedUsers.set(socket.id, socketUser);
      
      // Notify other users in the room
      socket.to(pageId).emit('user-joined', {
        userId: user.id,
        username: user.username,
        joinedAt: new Date(),
      });
      
      // Send current users in the room
      const roomUsers = Array.from(connectedUsers.values())
        .filter(u => u.pageId === pageId)
        .map(u => ({
          id: u.id,
          username: u.username,
          joinedAt: u.joinedAt,
        }));
      
      socket.emit('room-users', roomUsers);
      
      logger.info(`User ${user.username} joined page ${pageId}`);
    });

    // Handle leaving a page room
    socket.on('leave-page', (pageId: string) => {
      socket.leave(pageId);
      
      // Notify other users in the room
      socket.to(pageId).emit('user-left', {
        userId: user.id,
        username: user.username,
        leftAt: new Date(),
      });
      
      logger.info(`User ${user.username} left page ${pageId}`);
    });

    // Handle new chat messages
    socket.on('new-message', (data: {
      pageId: string;
      content: string;
      messageId: string;
    }) => {
      // Broadcast the message to all users in the page room
      socket.to(data.pageId).emit('message-received', {
        id: data.messageId,
        userId: user.id,
        username: user.username,
        content: data.content,
        createdAt: new Date(),
        pageId: data.pageId,
      });
      
      logger.info(`Message sent by ${user.username} in page ${data.pageId}`);
    });

    // Handle new media uploads
    socket.on('new-media', (data: {
      pageId: string;
      mediaId: string;
      type: string;
      caption?: string;
    }) => {
      // Broadcast the new media to all users in the page room
      socket.to(data.pageId).emit('media-uploaded', {
        id: data.mediaId,
        uploaderId: user.id,
        uploaderName: user.username,
        type: data.type,
        caption: data.caption,
        createdAt: new Date(),
        pageId: data.pageId,
      });
      
      logger.info(`Media uploaded by ${user.username} in page ${data.pageId}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (pageId: string) => {
      socket.to(pageId).emit('user-typing', {
        userId: user.id,
        username: user.username,
      });
    });

    socket.on('typing-stop', (pageId: string) => {
      socket.to(pageId).emit('user-stopped-typing', {
        userId: user.id,
        username: user.username,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const socketUser = connectedUsers.get(socket.id);
      if (socketUser) {
        // Notify other users in the room
        socket.to(socketUser.pageId).emit('user-left', {
          userId: socketUser.id,
          username: socketUser.username,
          leftAt: new Date(),
        });
        
        connectedUsers.delete(socket.id);
      }
      
      logger.info(`User disconnected: ${user.username} (${socket.id})`);
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes
    
    for (const [socketId, user] of connectedUsers.entries()) {
      if (now - user.joinedAt.getTime() > timeout) {
        connectedUsers.delete(socketId);
        logger.info(`Cleaned up inactive connection: ${user.username}`);
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
};

export const getConnectedUsers = (pageId?: string): SocketUser[] => {
  const users = Array.from(connectedUsers.values());
  return pageId ? users.filter(u => u.pageId === pageId) : users;
};

export const getUserCount = (pageId?: string): number => {
  return getConnectedUsers(pageId).length;
};