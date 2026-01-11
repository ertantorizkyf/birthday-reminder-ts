import { Table, Column, Model, DataType, PrimaryKey, Default, Unique, AllowNull } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'bday_users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  first_name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  last_name!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  birthday_date!: string;

  @Column(DataType.STRING(255))
  location?: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  timezone!: string;
}