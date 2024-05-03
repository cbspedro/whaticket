import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Schedules", "mediaPath", {
      allowNull: true,
      type: DataTypes.TEXT
    })
    .then(() => {
      return queryInterface.addColumn("Schedules", "mediaName", {
        allowNull: true,
        type: DataTypes.TEXT
      });
    })
    
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Schedules", "mediaPath")
    .then(() => {
      return queryInterface.removeColumn("Schedules", "mediaName");
    })
  }
  
};
