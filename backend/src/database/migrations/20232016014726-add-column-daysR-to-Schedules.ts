import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Schedules", "daysR", {
      type: DataTypes.INTEGER, 
      allowNull: true,
    })
    .then(() => {
      return queryInterface.addColumn("Schedules", "campId", {
        allowNull: true,
        type: DataTypes.INTEGER
      });
    })
    
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Schedules", "daysR")
    .then(() => {
      return queryInterface.removeColumn("Schedules", "campId");
    })
    
  }
};


