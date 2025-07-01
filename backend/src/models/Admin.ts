import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/config/database';
import { Admin as AdminInterface, AdminPermissions } from '@/types';

interface AdminCreationAttributes extends Optional<AdminInterface, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'createdBy'> {}

class Admin extends Model<AdminInterface, AdminCreationAttributes> implements AdminInterface {
  public id!: string;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public level!: 1 | 2 | 3;
  public permissions!: AdminPermissions;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public createdBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Admin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true,
        isAlphanumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2, 3]],
      },
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        canCreateAdmins: false,
        canManagePages: false,
        canManageUsers: false,
        canManageMedia: false,
        canViewAnalytics: false,
      },
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
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['level'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default Admin;