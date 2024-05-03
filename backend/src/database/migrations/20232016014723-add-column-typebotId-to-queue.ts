import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Contacts", "typebotToken", {
      allowNull: true,
      type: DataTypes.STRING
    })
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "typebotToken")
      
  }
};
