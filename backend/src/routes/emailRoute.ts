import express from "express";
import {
  enviarEmail,
  listarEmailsAgendados,
  listarEmailsEnviados,
  agendarEnvioEmail
} from "../controllers/emailController";
import isAuth from "../middleware/isAuth";
const emailRoutes = express.Router();
emailRoutes.post("/enviar-email", isAuth, enviarEmail);
emailRoutes.get("/listar-emails-enviados", isAuth, listarEmailsEnviados);
emailRoutes.get("/listar-emails-agendados", isAuth, listarEmailsAgendados);
emailRoutes.post("/agendar-envio-email", isAuth, agendarEnvioEmail);
export default emailRoutes;
