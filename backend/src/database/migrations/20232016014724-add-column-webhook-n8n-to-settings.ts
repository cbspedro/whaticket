import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Settings", "n8nUrl", {
      allowNull: true,
      type: DataTypes.STRING
    })
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Settings", "n8nUrl")
      
  }
};
