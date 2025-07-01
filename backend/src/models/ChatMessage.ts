import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';
import { ChatMessage as ChatMessageInterface } from '@/types';

interface ChatMessageCreationAttributes extends Optional<ChatMessageInterface, 'id' | 'createdAt' | 'updatedAt' | 'metadata'> {}

class ChatMessage extends Model<ChatMessageInterface, ChatMessageCreationAttributes> implements ChatMessageInterface {
  public id!: string;
  public pageId!: string;
  public userId!: string;
  public content!: string;
  public type!: 'text' | 'system';
  public metadata?: any;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getUser!: () => Promise<any>;
  public getMediaPage!: () => Promise<any>;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'media_pages',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM('text', 'system'),
      allowNull: false,
      defaultValue: 'text',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    indexes: [
      {
        fields: ['pageId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['isDeleted'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default ChatMessage;