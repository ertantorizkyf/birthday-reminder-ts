import { userRepository } from '../repositories/users.repository';
import { User } from '../models/User';

interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  birthdayDate: string;
  location: string;
  timezone: string;
}

interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthdayDate?: string;
  location?: string;
  timezone?: string;
}

interface UserResponse {
  firstName: string;
  lastName: string;
  email: string;
  birthdayDate: string;
  location: string;
  timezone: string;
}

export class UserService {
  async createUser(data: CreateUserDTO): Promise<UserResponse> {
    // Email must be unique
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Validate timezone
    if (!this.isValidTimezone(data.timezone)) {
      throw new Error('Invalid timezone');
    }

    const user:User = await userRepository.create(data);
    const resp:UserResponse = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      birthdayDate: user.birthday_date,
      location: user.location as string,
      timezone: user.timezone,
    };

    return resp;
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const resp:UserResponse = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      birthdayDate: user.birthday_date,
      location: user.location as string,
      timezone: user.timezone,
    }

    return resp;
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<UserResponse> {
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use');
      }
    }

    // Validate timezone
    if (data.timezone && !this.isValidTimezone(data.timezone as string)) {
      throw new Error('Invalid timezone');
    }

    const updateData: Partial<User> = {
      ...(data.firstName && { first_name: data.firstName }),
      ...(data.lastName && { last_name: data.lastName }),
      ...(data.email && { email: data.email }),
      ...(data.birthdayDate && { birthday_date: data.birthdayDate }),
      ...(data.location && { location: data.location }),
      ...(data.timezone && { timezone: data.timezone }),
    };
    const updated: User | null = await userRepository.update(id, updateData);
    if (!updated) {
      throw new Error('User not found');
    }

    var resp:UserResponse = {
      firstName: updated.first_name,
      lastName: updated.last_name,
      email: updated.email,
      birthdayDate: updated.birthday_date,
      location: updated.location as string,
      timezone: updated.timezone,
    };

    return resp;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new Error('User not found');
    }
  }

  private isValidTimezone(tz: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }
}

export const userService = new UserService();