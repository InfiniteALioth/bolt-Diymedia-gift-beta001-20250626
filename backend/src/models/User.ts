import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';
import { User as UserInterface } from '@/types';

interface UserCreationAttributes extends Optional<UserInterface, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'avatar' | 'email'> {}

class User extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
  public id!: string;
  public username!: string;
  public email?: string;
  public deviceId!: string;
  public avatar?: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getMediaItems!: () => Promise<any[]>;
  public getChatMessages!: () => Promise<any[]>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['deviceId'],
      },
      {
        unique: true,
        fields: ['email'],
        where: {
          email: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        fields: ['username'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default User;