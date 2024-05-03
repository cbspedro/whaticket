import Whatsapp from "../../models/Whatsapp";
export async function getGreetingMessage(whatsappId) {
  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      throw new Error("Registro do WhatsApp não encontrado.");
    }
    return whatsapp.greetingMessage;
  } catch (error) {
    console.error("Erro ao buscar a mensagem de saudação:", error);
    throw error;
  }
}
export default getGreetingMessage;
