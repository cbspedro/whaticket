import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "userCreation",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "hoursCloseTicketsAuto",
          value: "9999999999",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "chatBotType",
          value: "text",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "userRandom",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "sendMsgTransfTicket",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "scheduleType",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "CheckMsgIsGroup",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "sendGreetingAccepted",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "acceptCallWhatsapp",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "userRating",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "sendGreetingMessageOneQueues",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "sendSignMessage",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "sendQueuePosition",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "acceptAudioMessageContact",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "sendFarewellWaitingTicket",
          value: "enabled",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "ipixc",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "tokenixc",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "ipmkauth",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "clientidmkauth",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "clientsecretmkauth",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "smtpauth",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "usersmtpauth",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "clientsecretsmtpauth",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          key: "asaas",
          value: "",
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {});
  },
};
