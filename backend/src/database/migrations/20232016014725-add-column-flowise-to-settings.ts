import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Settings", "urlFlow", {
      allowNull: true,
      type: DataTypes.STRING
    })
    .then(() => {
      return queryInterface.addColumn("Settings", "tokenFlow", {
        allowNull: true,
        type: DataTypes.STRING
      });
    })
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Settings", "urlFlow")
    .then(() => {
      return queryInterface.removeColumn("Settings", "tokenFlow");
    })
      
  }
  
};
