import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { User } from '../models/User';
import { userRepository } from '../repositories/users.repository';
import { birthdayMessageRepository } from '../repositories/birthdayMessages.repository';
import { BirthdayMessage, MessageStatus } from '../models/BirthdayMessage';

dayjs.extend(utc);
dayjs.extend(timezone);

const SEND_HOUR = 9; // 9am local time
const MAX_RETRIES = 3;

export class BirthdaySchedulerService {
  async scheduleAllBirthdayMessages(): Promise<void> {
    console.log('[Scheduler] Starting birthday message scheduling...');
    
    const users = await userRepository.findAll(10000, 0); // Fetch all users
    let scheduled = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        const isBirthday = this.isBirthdayToday(user.birthday_date, user.timezone);
        
        if (isBirthday) {
          const shouldSend = await this.shouldSendMessage(user);
          
          if (shouldSend) {
            await this.scheduleMessage(user);
            scheduled++;
          } else {
            skipped++;
          }
        }
      } catch (error) {
        console.error(`[Scheduler] Error scheduling for user ${user.id}:`, error);
      }
    }

    console.log(`[Scheduler] Scheduled: ${scheduled}, Skipped: ${skipped}`);
  }

  async processPendingMessages(): Promise<void> {
    console.log('[Processor] Processing pending birthday messages...');
    
    const today = dayjs().format('YYYY-MM-DD');
    const messages = await birthdayMessageRepository.findPendingMessages(today);
    
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        const userNow = dayjs().tz(message.user.timezone);
        const currentHour = userNow.hour();
      
        if (currentHour < SEND_HOUR) {
          skipped++;
          continue; // Not 9am yet, skip for now
        }

        await this.processMessage(message);
        sent++;
      } catch (error) {
        console.error(`[Processor] Error processing message ${message.id}:`, error);
        failed++;
      }
    }

    console.log(`[Processor] Sent: ${sent}, Failed: ${failed}`);
  }

  async recoverUnsentMessages(daysBack = 7): Promise<void> {
    console.log(`[Recovery] Recovering unsent messages from last ${daysBack} days...`);
    
    const endDate = dayjs().format('YYYY-MM-DD');
    const startDate = dayjs().subtract(daysBack, 'day').format('YYYY-MM-DD');
    
    const unsentMessages = await birthdayMessageRepository.findUnsentMessagesInDateRange(
      startDate,
      endDate
    );

    let recovered = 0;
    let failed = 0;

    for (const message of unsentMessages) {
      try {
        await this.processMessage(message);
        recovered++;
      } catch (error) {
        console.error(`[Recovery] Error recovering message ${message.id}:`, error);
        failed++;
      }
    }

    console.log(`[Recovery] Recovered: ${recovered}, Failed: ${failed}`);
  }

  async retryFailedMessages(): Promise<void> {
    console.log('[Retry] Retrying failed messages...');
    
    const today = dayjs().format('YYYY-MM-DD');
    const failedMessages = await birthdayMessageRepository.findFailedMessages(today, MAX_RETRIES);
    
    let retried = 0;

    for (const message of failedMessages) {
      try {
        await this.processMessage(message);
        retried++;
      } catch (error) {
        console.error(`[Retry] Failed to retry message ${message.id}:`, error);
      }
    }

    console.log(`[Retry] Retried: ${retried} messages`);
  }

  private isBirthdayToday(birthdayDate: string, userTimezone: string): boolean {
    const now = dayjs().tz(userTimezone);
    const birthday = dayjs(birthdayDate);
    
    return now.month() === birthday.month() && now.date() === birthday.date();
  }

  private async shouldSendMessage(user: User): Promise<boolean> {
    const now = dayjs().tz(user.timezone);
    
    const today = now.format('YYYY-MM-DD');
    const { message, created } = await birthdayMessageRepository.findOrCreateMessage(
      user.id,
      today,
      this.createUserSnapshot(user)
    );

    // Skip existing message to prevent duplicates
    if (!created && message.status === MessageStatus.SENT) {
      return false;
    }

    return true;
  }

  private async scheduleMessage(user: User): Promise<void> {
    const today = dayjs().tz(user.timezone).format('YYYY-MM-DD');
    
    await birthdayMessageRepository.findOrCreateMessage(
      user.id,
      today,
      this.createUserSnapshot(user)
    );
    
    console.log(`[Scheduler] Scheduled message for ${user.first_name} ${user.last_name} (${user.email})`);
  }

  private async processMessage(message: BirthdayMessage): Promise<void> {
    try {
      if (await birthdayMessageRepository.hasUserDataChanged(message, message.user)) {
        await birthdayMessageRepository.markAsInvalidated(message.id);
        console.log(`[Processor] User data changed, invalidated message ${message.id}`);
        return;
      }

      await this.sendBirthdayMessage(message);
      
      await birthdayMessageRepository.markAsSent(message.id);
      
      console.log(`[Processor] ✅ Sent birthday message to ${message.user.email}`);
    } catch (error: any) {
      await birthdayMessageRepository.markAsFailed(message.id, error.message);
      console.error(`[Processor] ❌ Failed to send message ${message.id}:`, error.message);
      throw error;
    }
  }

  private async sendBirthdayMessage(message: BirthdayMessage): Promise<void> {
    const { first_name, last_name } = message.user_snapshot;
    const fullName = `${first_name} ${last_name}`;
    
    // TODO: Replace with actual API call
    console.log(`🎉 Hey, ${fullName} it's your birthday!`);
    
    // Simulate potential failure for testing
    if (Math.random() < 0.05) {
      throw new Error('Simulated API failure');
    }
  }

  private createUserSnapshot(user: User) {
    return {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      birthday_date: user.birthday_date,
      timezone: user.timezone,
    };
  }
}

export const birthdaySchedulerService = new BirthdaySchedulerService();