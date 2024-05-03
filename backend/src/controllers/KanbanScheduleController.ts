import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import * as cron from "node-cron";
import CreateService from "../services/ScheduleServices/CreateService";

type ScheduleRequestData = {
  body: string;
  sendAt: string;
  contactId: number;
  companyId: number;
  userId: number;
  daysR: string;
};

export const createSchedule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { body, sendAt, contactId, userId, daysR } = req.body;
    const { companyId } = req.user;

    // Criar o cronjob
    const cronExpression = getRandomCronExpression(daysR);
    const cronJob = cron.schedule(cronExpression, async () => {
      // Lógica a ser executada no cronjob
      console.log("Cronjob executado!");

      // Criar um novo agendamento com base nos dados fornecidos
      const schedule = await CreateService({
        body,
        sendAt,
        contactId,
        companyId,
        userId,
      });

      // Emitir evento ou realizar outras ações se necessário
      const io = getIO();
      io.emit("schedule", { action: "create", schedule });
    });

    // Pode adicionar lógica adicional ou retornar uma resposta, se necessário
    return res.status(200).json({ message: "Schedule created successfully" });
  } catch (error) {
    // Lide com erros aqui
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Função para gerar uma expressão cron aleatória baseada nos dias fornecidos
const getRandomCronExpression = (daysR: string): string => {
  // Implemente a lógica para gerar a expressão cron baseada nos dias fornecidos
  // Aqui está um exemplo simples para dias de segunda a sexta às 9 da manhã
  return `0 ${getRandomMinutes()} ${getRandomSeconds()} 9 * ${daysR}`;
};

// Função para gerar minutos aleatórios (0-30)
const getRandomMinutes = (): number => {
  return Math.floor(Math.random() * 31);
};

// Função para gerar segundos aleatórios (1-60)
const getRandomSeconds = (): number => {
  return Math.floor(Math.random() * 60) + 1;
};
