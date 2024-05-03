import { Request, Response } from "express";
import { SendMail } from "../services/EmailService/EmailService";
import Email from "../models/Email";
import moment from "moment";
import cron from "node-cron";
import { Op } from "sequelize";
import winston from "winston";
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()]
});
export const enviarEmail = async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    const { email, tokenSenha, assunto, mensagem } = req.body;
    const sendAt = moment().add(1, "hour").format("YYYY-MM-DDTHH:mm");
    const result = await SendMail(
      companyId,
      email,
      tokenSenha,
      assunto,
      mensagem,
      sendAt
    );
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    res.status(200).json({ message: "E-mail enviado com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).json({ error: "Erro ao enviar e-mail" });
  }
};
export const listarEmailsEnviados = async (req: Request, res: Response) => {
  try {
    const emailsEnviados = await Email.findAll({
      where: { companyId: req.user.companyId, scheduled: null, sendAt: null }
    });
    res.status(200).json(emailsEnviados);
  } catch (error) {
    console.error("Erro ao listar e-mails enviados:", error);
    res.status(500).json({ error: "Erro ao listar e-mails enviados" });
  }
};
export const listarEmailsAgendados = async (req: Request, res: Response) => {
  try {
    const emailsAgendados = await Email.findAll({
      where: {
        companyId: req.user.companyId,
        scheduled: true,
        sendAt: { [Op.not]: null }
      }
    });
    res.status(200).json(emailsAgendados);
  } catch (error) {
    console.error("Erro ao listar e-mails agendados:", error);
    res.status(500).json({ error: "Erro ao listar e-mails agendados" });
  }
};
export const agendarEnvioEmail = async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    const { recipient, subject, message, sendAt } = req.body;
    const sendAtDate = new Date(sendAt);
    if (sendAtDate <= new Date()) {
      return res
        .status(400)
        .json({ error: "A data de envio deve ser no futuro" });
    }
    await Email.create({
      sender: req.body.email,
      subject: req.body.assunto,
      message: req.body.mensagem,
      companyId: companyId,
      scheduled: true,
      sendAt: new Date(sendAt)
    });
    res.status(200).json({ message: "E-mail agendado com sucesso" });
  } catch (error) {
    console.error("Erro ao agendar o envio de e-mail:", error);
    res.status(500).json({ error: "Erro ao agendar o envio de e-mail" });
  }
};
const enviarAgendamentosPendentes = async () => {
  try {
    const now = moment();
    const agendamentos = await Email.findAll({
      where: { scheduled: true, sendAt: { [Op.lte]: now.toDate() } }
    });
    for (const agendamento of agendamentos) {
      const result = await SendMail(
        agendamento.companyId,
        agendamento.sender,
        "",
        agendamento.subject,
        agendamento.message,
        agendamento.sendAt.toISOString(),
        ""
      );
      if (!result.error) {
        await agendamento.update({ scheduled: false });
        logger.info(
          `E-mail agendado enviado com sucesso para: ${agendamento.sender}`
        );
      } else {
        logger.error(
          `Erro ao enviar e-mail agendado para: ${agendamento.sender}, erro: ${result.error}`
        );
      }
    }
  } catch (error) {
    logger.error("Erro ao enviar agendamentos pendentes:", error);
  }
};
cron.schedule("*/30 * * * * *", enviarAgendamentosPendentes);
