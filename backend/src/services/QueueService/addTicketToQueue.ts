import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
export async function addTicketToQueue(ticket: Ticket, chosenQueue: Queue) {
  try {
    const updatedTicket = await Ticket.update(
      { queueId: chosenQueue.id },
      { where: { id: ticket.id } }
    );
    console.log(`Ticket ${ticket.id} adicionado à fila ${chosenQueue.name}`);
    return updatedTicket;
  } catch (error) {
    console.error("Erro ao adicionar ticket à fila:", error);
    throw error;
  }
}
export default addTicketToQueue;
