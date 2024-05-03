import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Settings", "urlTypeBot", {
      allowNull: true,
      type: DataTypes.STRING
    })
    .then(() => {
      return queryInterface.addColumn("Settings", "viewerTypeBot", {
        allowNull: true,
        type: DataTypes.STRING
      });
    })
    .then(() => {
      return queryInterface.addColumn("Settings", "apiKeyTypeBot", {
        allowNull: true,
        type: DataTypes.STRING
      });
    })
    .then(() => {
      return queryInterface.addColumn("Settings", "typeTimer", {
        allowNull: true,
        type: DataTypes.STRING
      });
    })
    .then(() => {
      return queryInterface.addColumn("Settings", "recordTimer", {
        allowNull: true,
        type: DataTypes.STRING
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Settings", "urlTypeBot")
      .then(() => {
        return queryInterface.removeColumn("Settings", "viewerTypeBot");
      })
      .then(() => {
        return queryInterface.removeColumn("Settings", "apiKeyTypeBot");
      })
      .then(() => {
        return queryInterface.removeColumn("Settings", "typeTimer");
      })
      .then(() => {
        return queryInterface.removeColumn("Settings", "recordTimer");
      });
  }
};
