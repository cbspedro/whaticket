import { Sequelize, Op } from "sequelize";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import WhatsappQueue from "../../models/WhatsappQueue";
import { getIO } from "../../libs/socket";
export const TicketTaskMoveToQueue = async () => {
  const io = getIO();
  console.log("Iniciando atualização de tickets sem fila");
  const tickets = await Ticket.findAll({
    where: {
      status: "pending",
      updatedAt: { [Op.lte]: Sequelize.literal("NOW() - INTERVAL '1 MINUTE'") },
      queueId: { [Op.or]: [0, null] },
      userId: { [Op.or]: [0, null] }
    }
  });
  for (const ticket of tickets) {
    const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
    if (whatsapp && whatsapp.chatGPTEnabled) {
      console.log(
        `Ticket ${ticket.id} pulado devido a chatGPTEnabled ser true.`
      );
      continue;
    }
    const queue = await Queue.findOne({
      where: { companyId: ticket.companyId },
      order: [["id", "ASC"]]
    });
    if (!queue) {
      console.log("Não foi encontrado fila para a empresa: ", ticket.companyId);
      continue;
    }
    const whatsappQueue = await WhatsappQueue.findOne({
      where: { queueId: queue.id }
    });
    const dataToUpdate: any = {
      status: "pending",
      queueId: queue?.id,
      chatbot: false
    };
    if (whatsappQueue) {
      dataToUpdate.whatsappId = whatsappQueue.id;
    }
    console.log("Atualizando ticket: ", ticket.id, "para a fila: ", queue?.id);
    try {
      await Ticket.update(dataToUpdate, { where: { id: ticket.id } });
      io.to(ticket.status)
        .to("notification")
        .to(ticket.id.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "update",
          ticket
        });
    } catch (error) {
      console.log(
        "TicketTaskMoveToQueue, ticketId: ",
        ticket.id,
        "erro:",
        error
      );
    }
  }
  console.log("Atualizado ", tickets.length, "tickets");
};
