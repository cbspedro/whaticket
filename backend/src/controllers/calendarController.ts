import { Request, Response } from "express";
import Evento from "../models/Evento";
import * as eventService from "../services/eventService/eventService";
export const criarEvento = async (req: Request, res: Response) => {
  try {
    const { title, description, start, end } = req.body;
    if (!title || !start || !end) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios" });
    }
    const companyId = req.user.companyId;
    const novoEvento = new Evento({
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      companyId
    });
    await novoEvento.save();
    return res.status(201).json(novoEvento);
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
export const listarEventos = async (req: Request, res: Response) => {
  try {
    const eventos = await eventService.listarEventos();
    return res.status(200).json(eventos);
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
export const marcarEventoConcluido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const evento = await eventService.marcarEventoConcluido(id);
    return res.status(200).json(evento);
  } catch (error) {
    console.error("Erro ao marcar evento como concluído:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
export const excluirEvento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findByPk(id);
    if (!evento) {
      throw new Error("Evento não encontrado");
    }
    await evento.destroy();
    return res.status(200).json({ message: "Evento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
