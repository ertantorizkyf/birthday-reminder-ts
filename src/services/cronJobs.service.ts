import cron, { ScheduledTask } from 'node-cron';
import { birthdaySchedulerService } from './birthdayScheduler.service';

export class CronJobsService {
  private jobs: ScheduledTask[] = [];

  start(): void {
    console.log('[Cron] Starting scheduled jobs...');

    // Schedule birthday messages 6 hours
    const scheduleJob = cron.schedule('0 */6 * * *', async () => {
      console.log('[Cron] Running birthday scheduler...');
      await birthdaySchedulerService.scheduleAllBirthdayMessages();
    });

    // Schedule pending messages every minute
    const processJob = cron.schedule('* * * * *', async () => {
      console.log('[Cron] Processing pending messages...');
      await birthdaySchedulerService.processPendingMessages();
    });

    // Retry failed messages every 30 minutes
    const retryJob = cron.schedule('*/30 * * * *', async () => {
      console.log('[Cron] Retrying failed messages...');
      await birthdaySchedulerService.retryFailedMessages();
    });

    // Recover unsent messages few several days back if system went down
    // For the sake of POC, taking 7 days back as example
    // Runs every midnight
    const recoveryJob = cron.schedule('0 0 * * *', async () => {
      console.log('[Cron] Running recovery job...');
      await birthdaySchedulerService.recoverUnsentMessages(7);
    });

    this.jobs.push(scheduleJob, processJob, retryJob, recoveryJob);
    
    console.log('[Cron] ✅ All jobs started');
  }

  stop(): void {
    console.log('[Cron] Stopping all jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
  }
}

export const cronJobsService = new CronJobsService();