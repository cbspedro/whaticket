import { QueryInterface, DataTypes } from "sequelize";
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Chatbots", "optionType", {
      defaultValue: "text",
      type: DataTypes.STRING
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Chatbots", "optionType");
  }
};
