'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bday_birthday_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bday_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      scheduled_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'The date this message was scheduled for (YYYY-MM-DD)'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'invalidated'),
        allowNull: false,
        defaultValue: 'pending'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Actual timestamp when message was sent'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      user_snapshot: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Snapshot of user data at scheduling time to detect changes'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('bday_birthday_messages', ['user_id', 'scheduled_date'], {
      unique: true,
      name: 'bday_birthday_messages_user_date_unique_idx'
    });

    await queryInterface.addIndex('bday_birthday_messages', ['status', 'scheduled_date'], {
      name: 'bday_birthday_messages_status_date_idx'
    });

    await queryInterface.addIndex('bday_birthday_messages', ['scheduled_date'], {
      name: 'bday_birthday_messages_scheduled_date_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('bday_birthday_messages', 'bday_birthday_messages_user_date_unique_idx');
    await queryInterface.removeIndex('bday_birthday_messages', 'bday_birthday_messages_status_date_idx');
    await queryInterface.removeIndex('bday_birthday_messages', 'bday_birthday_messages_scheduled_date_idx');
    await queryInterface.dropTable('bday_birthday_messages');
  }
};