import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';
import { MediaPage as MediaPageInterface } from '@/types';

interface MediaPageCreationAttributes extends Optional<MediaPageInterface, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'qrCode'> {}

class MediaPage extends Model<MediaPageInterface, MediaPageCreationAttributes> implements MediaPageInterface {
  public id!: string;
  public name!: string;
  public description?: string;
  public purchaserName!: string;
  public purchaserEmail!: string;
  public purchaserGender!: 'male' | 'female' | 'other';
  public usageScenario!: string;
  public uniqueLink!: string;
  public qrCode?: string;
  public internalCode!: string;
  public dbSizeLimit!: number;
  public dbUsage!: number;
  public usageDuration!: number;
  public remainingDays!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public expiresAt!: Date;

  // Associations
  public getMediaItems!: () => Promise<any[]>;
  public getChatMessages!: () => Promise<any[]>;
  public getUsers!: () => Promise<any[]>;
}

MediaPage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    purchaserName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true,
      },
    },
    purchaserEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    purchaserGender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    usageScenario: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
    },
    uniqueLink: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      validate: {
        isUrl: true,
        notEmpty: true,
      },
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    internalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 20],
        notEmpty: true,
      },
    },
    dbSizeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1024, // 1GB in MB
      validate: {
        min: 100,
        max: 10240, // 10GB max
      },
    },
    dbUsage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    usageDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30, // 30 days
      validate: {
        min: 1,
        max: 365,
      },
    },
    remainingDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MediaPage',
    tableName: 'media_pages',
    indexes: [
      {
        unique: true,
        fields: ['uniqueLink'],
      },
      {
        unique: true,
        fields: ['internalCode'],
      },
      {
        fields: ['purchaserEmail'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
    hooks: {
      beforeCreate: (page: MediaPage) => {
        // Set expiration date
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + page.usageDuration);
        page.expiresAt = expirationDate;
        page.remainingDays = page.usageDuration;
      },
    },
  }
);

export default MediaPage;