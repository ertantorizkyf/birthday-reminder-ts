import { BirthdayMessage, MessageStatus } from '../models/BirthdayMessage';
import { User } from '../models/User';
import { Op } from 'sequelize';

export class BirthdayMessageRepository {
  async createMessage(
    userId: string,
    scheduledDate: string,
    userSnapshot: any
  ): Promise<BirthdayMessage> {
    return await BirthdayMessage.create({
      user_id: userId,
      scheduled_date: scheduledDate,
      user_snapshot: userSnapshot,
      status: MessageStatus.PENDING,
    });
  }

  async findOrCreateMessage(
    userId: string,
    scheduledDate: string,
    userSnapshot: any
  ): Promise<{ message: BirthdayMessage; created: boolean }> {
    const [message, created] = await BirthdayMessage.findOrCreate({
      where: {
        user_id: userId,
        scheduled_date: scheduledDate,
      },
      defaults: {
        user_snapshot: userSnapshot,
        status: MessageStatus.PENDING,
      },
    });

    return { message, created };
  }

  async findPendingMessages(scheduledDate: string): Promise<BirthdayMessage[]> {
    return await BirthdayMessage.findAll({
      where: {
        scheduled_date: scheduledDate,
        status: MessageStatus.PENDING,
      },
      include: [{ model: User }],
    });
  }

  async findFailedMessages(
    scheduledDate: string,
    maxRetries = 3
  ): Promise<BirthdayMessage[]> {
    return await BirthdayMessage.findAll({
      where: {
        scheduled_date: scheduledDate,
        status: MessageStatus.FAILED,
        retry_count: { [Op.lt]: maxRetries },
      },
      include: [{ model: User }],
    });
  }

  async markAsSent(messageId: string): Promise<void> {
    await BirthdayMessage.update(
      {
        status: MessageStatus.SENT,
        sent_at: new Date(),
      },
      { where: { id: messageId } }
    );
  }

  async markAsFailed(messageId: string, errorMessage: string): Promise<void> {
    await BirthdayMessage.update(
      {
        status: MessageStatus.FAILED,
        error_message: errorMessage,
        retry_count: this.incrementRetryCount(),
      },
      { where: { id: messageId } }
    );
  }

  async markAsInvalidated(messageId: string): Promise<void> {
    await BirthdayMessage.update(
      {
        status: MessageStatus.INVALIDATED,
        error_message: 'User data changed since scheduling',
      },
      { where: { id: messageId } }
    );
  }

  async hasUserDataChanged(message: BirthdayMessage, currentUser: User): Promise<boolean> {
    const snapshot = message.user_snapshot;
    return (
      snapshot.first_name !== currentUser.first_name ||
      snapshot.last_name !== currentUser.last_name ||
      snapshot.birthday_date !== currentUser.birthday_date ||
      snapshot.timezone !== currentUser.timezone
    );
  }

  async findUnsentMessagesInDateRange(
    startDate: string,
    endDate: string
  ): Promise<BirthdayMessage[]> {
    return await BirthdayMessage.findAll({
      where: {
        scheduled_date: {
          [Op.between]: [startDate, endDate],
        },
        status: MessageStatus.PENDING,
      },
      include: [{ model: User }],
    });
  }

  private incrementRetryCount() {
    // Sequelize literal to increment atomically
    return BirthdayMessage.sequelize!.literal('retry_count + 1');
  }
}

export const birthdayMessageRepository = new BirthdayMessageRepository();