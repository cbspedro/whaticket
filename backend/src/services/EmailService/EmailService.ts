import nodemailer from "nodemailer";
import Setting from "../../models/Setting";
import Email from "../../models/Email";
import * as cron from "node-cron";
import moment from "moment";
export const SendMail = async (
  companyId: number,
  email: string,
  tokenSenha: string,
  assunto: string,
  mensagem: string,
  sendAt: string,
  cronExpression?: string
) => {
  try {
    const url = await Setting.findOne({
      where: { companyId, key: "smtpauth" }
    });
    const user = await Setting.findOne({
      where: { companyId, key: "usersmtpauth" }
    });
    const password = await Setting.findOne({
      where: { companyId, key: "clientsecretsmtpauth" }
    });
    const urlSmtp = url.value;
    const userSmtp = user.value;
    const passwordSmtp = password.value;
    const transporter = nodemailer.createTransport({
      host: urlSmtp,
      port: Number("587"),
      secure: false,
      auth: { user: userSmtp, pass: passwordSmtp }
    });
    async function sendEmail(formattedSendAt: string) {
      try {
        const mailOptions = {
          from: userSmtp,
          to: email,
          subject: assunto,
          text: mensagem
        };
        await transporter.sendMail(mailOptions);
        await Email.create({
          sender: email,
          subject: assunto,
          message: mensagem,
          companyId: companyId
        });
        return { message: "E-mail agendado e salvo com sucesso" };
      } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        throw new Error("Erro ao enviar e-mail: " + error);
      }
    }
    if (cronExpression) {
      cron.schedule(cronExpression, () => {
        const formattedSendAt = moment()
          .add(1, "hour")
          .format("YYYY-MM-DDTHH:mm");
        sendEmail(formattedSendAt);
      });
      return { message: "Agendamento de e-mail realizado com sucesso" };
    } else {
      const formattedSendAt = moment()
        .add(1, "hour")
        .format("YYYY-MM-DDTHH:mm");
      sendEmail(formattedSendAt);
      return { message: "E-mail enviado imediatamente" };
    }
  } catch (error) {
    console.error("Erro ao agendar e-mail:", error);
    return { error: "Erro ao agendar e-mail: " + error.message };
  }
};
export default SendMail;
