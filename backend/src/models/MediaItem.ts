import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';
import { MediaItem as MediaItemInterface } from '@/types';

interface MediaItemCreationAttributes extends Optional<MediaItemInterface, 'id' | 'createdAt' | 'updatedAt' | 'thumbnailUrl' | 'caption' | 'metadata'> {}

class MediaItem extends Model<MediaItemInterface, MediaItemCreationAttributes> implements MediaItemInterface {
  public id!: string;
  public pageId!: string;
  public uploaderId!: string;
  public type!: 'image' | 'video' | 'audio';
  public filename!: string;
  public originalName!: string;
  public mimeType!: string;
  public size!: number;
  public url!: string;
  public thumbnailUrl?: string;
  public caption?: string;
  public metadata?: any;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getUser!: () => Promise<any>;
  public getMediaPage!: () => Promise<any>;
}

MediaItem.init(
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
    uploaderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('image', 'video', 'audio'),
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    thumbnailUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MediaItem',
    tableName: 'media_items',
    indexes: [
      {
        fields: ['pageId'],
      },
      {
        fields: ['uploaderId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default MediaItem;