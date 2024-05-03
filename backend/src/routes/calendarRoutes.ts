import express from "express";
import {
  criarEvento,
  listarEventos,
  marcarEventoConcluido,
  excluirEvento
} from "../controllers/calendarController";
import isAuth from "../middleware/isAuth";
const calendarRoutes = express.Router();
calendarRoutes.post("/eventos", isAuth, criarEvento);
calendarRoutes.get("/eventos", isAuth, listarEventos);
calendarRoutes.put("/eventos/:id/concluido", isAuth, marcarEventoConcluido);
calendarRoutes.delete("/eventos/:id", isAuth, excluirEvento);
export default calendarRoutes;
