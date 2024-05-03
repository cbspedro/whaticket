'use strict';
import {
  DataTypes
} from "sequelize";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Whatsapps', 'maxUseBotQueueId', {
          type: DataTypes.INTEGER,
          references: {
              model: "Queues",
              key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Whatsapps', 'maxUseBotQueueId');
    }
};