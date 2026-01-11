import { User } from '../models/User';
import { Op } from 'sequelize';

export class UserRepository {
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    birthdayDate: string;
    location?: string;
    timezone: string;
  }): Promise<User> {
    return await User.create({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      birthday_date: data.birthdayDate,
      location: data.location,
      timezone: data.timezone,
    });
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.update(data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.destroy({ where: { id } });
    return result > 0;
  }
}

export const userRepository = new UserRepository();