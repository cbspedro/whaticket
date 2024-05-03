import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import * as ApiController from "../controllers/ApiController";
import * as ApiMessage from "../services/WbotServices/wbotMessageListener";
import tokenAuth from "../middleware/tokenAuth";
import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
const upload = multer(uploadConfig);
const ApiRoutes = express.Router();

// rotas para enviar menssagens //

ApiRoutes.post("/messages/send", tokenAuth, upload.array("medias"), ApiController.index);
ApiRoutes.post("/messages/send/linkPdf", tokenAuth, ApiController.indexLink);
ApiRoutes.post("/messages/send/linkImage", tokenAuth, ApiController.indexImage);
ApiRoutes.post("/messages/checkNumber", tokenAuth, ApiController.checkNumber);
ApiRoutes.post("/messages/send/linkAudio", tokenAuth, ApiController.handleAudioLink);

// rotas para manipular tickets //
// trocar fila // 
ApiRoutes.post("/ticket/QueueUpdate/:ticketId", tokenAuth, ApiController.updateQueueId);
//encerrarticket
ApiRoutes.post("/ticket/close/:ticketId", tokenAuth, ApiController.closeTicket);

// adicionar e remover tags //
ApiRoutes.post("/ticket/TagUpdate", tokenAuth, ApiController.updateTicketTag);
ApiRoutes.delete("/ticket/TagRemove", tokenAuth, ApiController.removeTicketTag);
// listar tickets //
ApiRoutes.get("/ticket/ListTickets", tokenAuth, ApiController.listTicketsByCompany);
ApiRoutes.get("/ticket/ListByTag/:tagId", tokenAuth, ApiController.listTicketsByTag);

//invoices

ApiRoutes.get("/invoices", tokenAuth, ApiController.indexApi);
ApiRoutes.get("/invoices/:Invoiceid", tokenAuth, ApiController.showApi);
ApiRoutes.post("/invoices/listByCompany", tokenAuth, ApiController.showAllApi);
ApiRoutes.put("/invoices/:id", tokenAuth, ApiController.updateApi);


ApiRoutes.post("/messageUp", tokenAuth, ApiMessage.wbotMessageListenerWeb);




export default ApiRoutes;
