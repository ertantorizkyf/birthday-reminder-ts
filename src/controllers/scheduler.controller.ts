import { Request, Response, NextFunction } from 'express';
import { birthdaySchedulerService } from '../services/birthdayScheduler.service';

export class SchedulerController {
  async manualSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await birthdaySchedulerService.scheduleAllBirthdayMessages();
      res.json({
        success: true,
        message: 'Birthday messages scheduled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async processPending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await birthdaySchedulerService.processPendingMessages();
      res.json({
        success: true,
        message: 'Pending messages processed',
      });
    } catch (error) {
      next(error);
    }
  }

  async recoverUnsent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const daysBack = parseInt(req.query.days as string) || 7;
      await birthdaySchedulerService.recoverUnsentMessages(daysBack);
      res.json({
        success: true,
        message: `Recovered unsent messages from last ${daysBack} days`,
      });
    } catch (error) {
      next(error);
    }
  }

  async retryFailed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await birthdaySchedulerService.retryFailedMessages();
      res.json({
        success: true,
        message: 'Failed messages retried',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const schedulerController = new SchedulerController();