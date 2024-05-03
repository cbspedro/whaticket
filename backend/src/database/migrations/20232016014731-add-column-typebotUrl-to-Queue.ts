import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Queues", "typebotUrl", {
      allowNull: true,
      type: DataTypes.STRING
    }).then(() => {
      return queryInterface.addColumn("Queues", "typebotName", {
        allowNull: true,
        type: DataTypes.TEXT
      });
    })
    
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "typebotUrl")
    .then(() => {
      return queryInterface.removeColumn("Queues", "typebotName");
    })
  }
};
