import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Queues", "typebotToken", {
      allowNull: true,
      type: DataTypes.STRING
    })
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "typebotToken")
      
  }
};
