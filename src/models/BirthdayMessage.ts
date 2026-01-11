import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  INVALIDATED = 'invalidated'
}

@Table({
  tableName: 'bday_birthday_messages',
  timestamps: true,
  underscored: true,
})
export class BirthdayMessage extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  scheduled_date!: string;

  @AllowNull(false)
  @Default(MessageStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(MessageStatus)))
  status!: MessageStatus;

  @Column(DataType.DATE)
  sent_at?: Date;

  @Column(DataType.TEXT)
  error_message?: string;

  @Default(0)
  @Column(DataType.INTEGER)
  retry_count!: number;

  @AllowNull(false)
  @Column(DataType.JSONB)
  user_snapshot!: {
    first_name: string;
    last_name: string;
    email: string;
    birthday_date: string;
    timezone: string;
  };
}