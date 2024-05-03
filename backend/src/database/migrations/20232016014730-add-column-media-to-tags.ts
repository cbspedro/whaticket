import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tags", "mediaPath", {
      allowNull: true,
      type: DataTypes.TEXT
    })
    .then(() => {
      return queryInterface.addColumn("Tags", "mediaName", {
        allowNull: true,
        type: DataTypes.TEXT
      });
    })
    
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tags", "mediaPath")
    .then(() => {
      return queryInterface.removeColumn("Tags", "mediaName");
    })
  }
  
};
