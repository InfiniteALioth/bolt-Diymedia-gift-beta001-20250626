import User from './User';
import MediaPage from './MediaPage';
import MediaItem from './MediaItem';
import ChatMessage from './ChatMessage';
import Admin from './Admin';

// Define associations
User.hasMany(MediaItem, { foreignKey: 'uploaderId', as: 'mediaItems' });
User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'chatMessages' });

MediaPage.hasMany(MediaItem, { foreignKey: 'pageId', as: 'mediaItems' });
MediaPage.hasMany(ChatMessage, { foreignKey: 'pageId', as: 'chatMessages' });

MediaItem.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });
MediaItem.belongsTo(MediaPage, { foreignKey: 'pageId', as: 'page' });

ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ChatMessage.belongsTo(MediaPage, { foreignKey: 'pageId', as: 'page' });

Admin.belongsTo(Admin, { foreignKey: 'createdBy', as: 'creator' });

export {
  User,
  MediaPage,
  MediaItem,
  ChatMessage,
  Admin
};

export default {
  User,
  MediaPage,
  MediaItem,
  ChatMessage,
  Admin
};