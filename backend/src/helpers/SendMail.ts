import nodemailer from "nodemailer";
export interface MailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
export async function SendMail(mailData: MailData) {
  const options: any = {
    host: process.env.MAIL_HOST,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
  };
  const transporter = nodemailer.createTransport(options);
  let info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: mailData.to,
    subject: mailData.subject,
    text: mailData.text,
    html: mailData.html || mailData.text
  });
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
