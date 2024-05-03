import express from "express";
import isAuth from "../middleware/isAuth";
import isAuthApi from "../middleware/tokenAuth";
import tokenAuth from "../middleware/tokenAuth";
import * as TicketController from "../controllers/TicketController";
const ticketRoutes = express.Router();
ticketRoutes.get("/tickets", isAuth, TicketController.index);
ticketRoutes.get("/ticket/kanban", isAuth, TicketController.kanban);
ticketRoutes.get("/tickets/:ticketId", isAuth, TicketController.show);
ticketRoutes.get("/tickets/u/:uuid", isAuth, TicketController.showFromUUID);
ticketRoutes.post("/tickets", isAuth, TicketController.store);
ticketRoutes.put("/tickets/:ticketId", isAuth, TicketController.update);
ticketRoutes.put("/tickets/:ticketId", isAuthApi, TicketController.update);
ticketRoutes.delete("/tickets/:ticketId", isAuth, TicketController.remove);


export default ticketRoutes;
