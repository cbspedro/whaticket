import nodemailer from "nodemailer";
import sequelize from "sequelize";
import database from "../../database";
import Setting from "../../models/Setting";
import { config } from "dotenv";
config();
interface UserData {
  companyId: number;
}
const SendMail = async (email: string, tokenSenha: string) => {
  const { hasResult, data } = await filterEmail(email);
  if (!hasResult) {
    return { status: 404, message: "Email não encontrado" };
  }
  const userData = data[0][0] as UserData;
  if (!userData || userData.companyId === undefined) {
    return { status: 404, message: "Dados do usuário não encontrados" };
  }
  const companyId = userData.companyId;
  const urlSmtp = process.env.MAIL_HOST;
  const userSmtp = process.env.MAIL_USER;
  const passwordSmpt = process.env.MAIL_PASS;
  const fromEmail = process.env.MAIL_FROM;
  const transporter = nodemailer.createTransport({
    host: urlSmtp,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: { user: userSmtp, pass: passwordSmpt }
  });
  if (hasResult === true) {
    const { hasResults, datas } = await insertToken(email, tokenSenha);
    async function sendEmail() {
      try {
        const mailOptions = {
          from: fromEmail,
          to: email,
          subject: "Redefinição de Senha - UNDER CONTROL TECHNOLOGY",
          text: `Olá,\n\nVocê solicitou a redefinição de senha para sua conta na UNDER CONTROL TECHNOLOGY. Utilize o seguinte Código de Verificação para concluir o processo de redefinição de senha:\n\nCódigo de Verificação: ${tokenSenha}\n\nPor favor, copie e cole o Código de Verificação no campo 'Código de Verificação' na plataforma UNDER CONTROL TECHNOLOGY.\n\nSe você não solicitou esta redefinição de senha, por favor, ignore este e-mail.\n\n\nAtenciosamente,\nEquipe UNDER CONTROL TECHNOLOGY`
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("E-mail enviado: " + info.response);
      } catch (error) {
        console.log(error);
      }
    }
    sendEmail();
  }
};
const filterEmail = async (email: string) => {
  const sql = `SELECT * FROM "Users"  WHERE email ='${email}'`;
  const result = await database.query(sql, {
    type: sequelize.QueryTypes.SELECT
  });
  return { hasResult: result.length > 0, data: [result] };
};
const insertToken = async (email: string, tokenSenha: string) => {
  const sqls = `UPDATE "Users" SET "resetPassword"= '${tokenSenha}' WHERE email ='${email}'`;
  const results = await database.query(sqls, {
    type: sequelize.QueryTypes.UPDATE
  });
  return { hasResults: results.length > 0, datas: results };
};
export default SendMail;
