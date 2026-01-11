import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  models: [User],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};