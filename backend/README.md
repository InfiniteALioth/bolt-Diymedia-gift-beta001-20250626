# Interactive Media Platform Backend

A robust Node.js backend API for the Interactive Media Platform, built with Express.js, TypeScript, and MySQL.

## Features

- **User Authentication**: JWT-based authentication for users and admins
- **Media Management**: Upload, store, and manage images, videos, and audio files
- **Real-time Chat**: Socket.IO powered real-time messaging
- **Admin Panel**: Comprehensive admin management system
- **File Storage**: Alibaba Cloud OSS integration for file storage
- **Rate Limiting**: Protection against abuse and spam
- **Logging**: Comprehensive logging with Winston
- **Database**: MySQL with Sequelize ORM
- **Validation**: Input validation and sanitization
- **Error Handling**: Centralized error handling

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **File Storage**: Alibaba Cloud OSS
- **Logging**: Winston
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Application entry point
├── logs/                # Log files
├── dist/                # Compiled JavaScript (production)
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   DB_HOST=your_mysql_host
   DB_PORT=3306
   DB_NAME=interactive_media_platform
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_refresh_token_secret
   
   # Alibaba Cloud OSS
   OSS_REGION=oss-cn-hangzhou
   OSS_ACCESS_KEY_ID=your_access_key_id
   OSS_ACCESS_KEY_SECRET=your_access_key_secret
   OSS_BUCKET=your_bucket_name
   ```

4. **Database Setup**
   - Create a MySQL database
   - The application will automatically create tables on first run

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/user/register` - User registration
- `POST /api/v1/auth/user/login` - User login
- `POST /api/v1/auth/admin/login` - Admin login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Pages
- `GET /api/v1/pages/:pageId` - Get page by ID (public)
- `GET /api/v1/pages/code/:internalCode` - Get page by code (public)
- `GET /api/v1/pages` - Get all pages (admin)
- `POST /api/v1/pages` - Create page (admin)
- `PUT /api/v1/pages/:pageId` - Update page (admin)
- `DELETE /api/v1/pages/:pageId` - Delete page (admin)
- `GET /api/v1/pages/:pageId/stats` - Get page statistics (admin)

### Media
- `GET /api/v1/media/:pageId` - Get media items for page
- `POST /api/v1/media/:pageId` - Upload media to page
- `DELETE /api/v1/media/:mediaId` - Delete media item
- `PUT /api/v1/media/:mediaId` - Update media item

### Chat
- `GET /api/v1/chat/:pageId` - Get chat messages for page
- `POST /api/v1/chat/:pageId` - Send message to page
- `DELETE /api/v1/chat/:messageId` - Delete message

### Upload
- `POST /api/v1/upload/single` - Upload single file
- `POST /api/v1/upload/multiple` - Upload multiple files

### Admin
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/stats` - Get global statistics
- `POST /api/v1/admin/admins` - Create admin
- `GET /api/v1/admin/admins` - Get all admins

## Socket.IO Events

### Client to Server
- `join-page` - Join a page room
- `leave-page` - Leave a page room
- `new-message` - Send new chat message
- `new-media` - Notify new media upload
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

### Server to Client
- `user-joined` - User joined the room
- `user-left` - User left the room
- `room-users` - Current users in room
- `message-received` - New message received
- `media-uploaded` - New media uploaded
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing

## Database Schema

### Users
- `id` (UUID, Primary Key)
- `username` (String, 50 chars)
- `email` (String, Optional)
- `deviceId` (String, Unique)
- `avatar` (Text, Optional)
- `isActive` (Boolean)
- `lastLoginAt` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Media Pages
- `id` (UUID, Primary Key)
- `name` (String, 100 chars)
- `description` (Text, Optional)
- `purchaserName` (String, 50 chars)
- `purchaserEmail` (String)
- `purchaserGender` (Enum: male/female/other)
- `usageScenario` (String, 100 chars)
- `uniqueLink` (String, Unique)
- `qrCode` (Text)
- `internalCode` (String, Unique)
- `dbSizeLimit` (Integer, MB)
- `dbUsage` (Integer, MB)
- `usageDuration` (Integer, Days)
- `remainingDays` (Integer)
- `isActive` (Boolean)
- `expiresAt` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Media Items
- `id` (UUID, Primary Key)
- `pageId` (UUID, Foreign Key)
- `uploaderId` (UUID, Foreign Key)
- `type` (Enum: image/video/audio)
- `filename` (String)
- `originalName` (String)
- `mimeType` (String)
- `size` (BigInt, Bytes)
- `url` (Text)
- `thumbnailUrl` (Text, Optional)
- `caption` (Text, Optional)
- `metadata` (JSON, Optional)
- `isActive` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Chat Messages
- `id` (UUID, Primary Key)
- `pageId` (UUID, Foreign Key)
- `userId` (UUID, Foreign Key)
- `content` (Text, 1000 chars max)
- `type` (Enum: text/system)
- `metadata` (JSON, Optional)
- `isDeleted` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Admins
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `passwordHash` (String)
- `level` (Integer: 1/2/3)
- `permissions` (JSON)
- `isActive` (Boolean)
- `lastLoginAt` (DateTime)
- `createdBy` (UUID, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **SQL Injection Protection**: Sequelize ORM with parameterized queries

## Deployment

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Alibaba Cloud OSS bucket
- Domain name (optional)

### Production Deployment

1. **Server Setup**
   ```bash
   # Install Node.js and PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Application Deployment**
   ```bash
   # Clone and build
   git clone <repository-url>
   cd backend
   npm install
   npm run build
   
   # Start with PM2
   pm2 start dist/server.js --name "media-platform-api"
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-api-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-api-domain.com
   ```

## Monitoring and Logs

- **Logs**: Located in `logs/` directory
- **Health Check**: `GET /health`
- **PM2 Monitoring**: `pm2 monit`
- **Log Rotation**: Automatic log rotation with Winston

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.