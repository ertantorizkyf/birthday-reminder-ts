import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/users.service';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id as string);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateUser(req.params.id as string, req.body);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteUser(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();