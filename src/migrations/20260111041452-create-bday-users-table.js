'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bday_users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      birthday_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'User birthday in YYYY-MM-DD format'
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Human-readable location (e.g., "Jakarta")'
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'IANA timezone identifier (e.g., "Asia/Jakarta")'
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

    await queryInterface.addIndex('bday_users', ['email'], {
      unique: true,
      name: 'bday_users_email_unique_idx'
    });

    await queryInterface.addIndex('bday_users', ['birthday_date'], {
      name: 'bday_users_birthday_date_idx'
    });

    await queryInterface.addIndex('bday_users', ['timezone'], {
      name: 'bday_users_timezone_idx'
    });

    await queryInterface.addIndex('bday_users', ['birthday_date', 'timezone'], {
      name: 'bday_users_birthday_timezone_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('bday_users', 'bday_users_email_unique_idx');
    await queryInterface.removeIndex('bday_users', 'bday_users_birthday_date_idx');
    await queryInterface.removeIndex('bday_users', 'bday_users_timezone_idx');
    await queryInterface.removeIndex('bday_users', 'bday_users_birthday_timezone_idx');
    
    await queryInterface.dropTable('bday_users');
  }
};