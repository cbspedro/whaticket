import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import * as ApiController from "../controllers/ApiController";
import tokenAuth from "../middleware/tokenAuth";
const upload = multer(uploadConfig);
const internRoutes = express.Router();
import isAuth from "../middleware/isAuth";

// rotas para enviar menssagens //

internRoutes.post("/messages/send", tokenAuth, upload.array("medias"), ApiController.index);
internRoutes.post("/messages/send/linkPdf", tokenAuth, ApiController.indexLink);
internRoutes.post("/messages/send/linkImage", tokenAuth, ApiController.indexImage);
internRoutes.post("/messages/checkNumber", tokenAuth, ApiController.checkNumber);

// rotas para manipular tickets //
// trocar fila // 
internRoutes.post("/ticket/QueueUpdate/:ticketId", tokenAuth, ApiController.updateQueueId);

// adicionar e remover tags //
internRoutes.post("/ticket/TagUpdate", isAuth, ApiController.updateTicketTag);
internRoutes.delete("/ticket/TagRemove", isAuth, ApiController.removeTicketTag);
// listar tickets //
internRoutes.get("/ticket/ListTickets", isAuth, ApiController.listTicketsByCompany);
internRoutes.get("/ticket/ListByTagIsAuth/:tagId", isAuth, ApiController.listTicketsByTagIsAuth);

export default internRoutes;
