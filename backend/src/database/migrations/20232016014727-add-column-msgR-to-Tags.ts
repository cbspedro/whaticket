import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tags", "msgR", {
      type: DataTypes.TEXT, 
      allowNull: true,
    }).then(() => {
      return queryInterface.addColumn("Tags", "rptDays", {
        allowNull: true,
        type: DataTypes.INTEGER
      });
    })
    .then(() => {
      return queryInterface.addColumn("Tags", "actCamp", {
        allowNull: true,
        type: DataTypes.INTEGER
      });
    })

  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tags", "msgR")
    .then(() => {
      return queryInterface.removeColumn("Tags", "rptDays");
    })
    .then(() => {
      return queryInterface.removeColumn("Tags", "actCamp");
    })

  }
};


