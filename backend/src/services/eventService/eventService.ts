import Evento from "../../models/Evento";
export const criarEvento = async eventoData => {
  try {
    const novoEvento = await Evento.create(eventoData);
    return novoEvento;
  } catch (error) {
    throw new Error("Erro ao criar evento: " + error.message);
  }
};
export const listarEventos = async () => {
  try {
    const eventos = await Evento.findAll();
    return eventos;
  } catch (error) {
    throw new Error("Erro ao listar eventos: " + error.message);
  }
};
export const marcarEventoConcluido = async eventoId => {
  try {
    const evento = await Evento.findByPk(eventoId);
    if (!evento) {
      throw new Error("Evento não encontrado");
    }
    evento.concluido = true;
    await evento.save();
    return evento;
  } catch (error) {
    throw new Error("Erro ao marcar evento como concluído: " + error.message);
  }
};
export const excluirEvento = async eventoId => {
  try {
    const evento = await Evento.findByPk(eventoId);
    if (!evento) {
      throw new Error("Evento não encontrado");
    }
    await evento.destroy();
    return evento;
  } catch (error) {
    throw new Error("Erro ao excluir evento: " + error.message);
  }
};
