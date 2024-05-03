import express from "express";
import isAuth from "../middleware/isAuth";
import * as WhatsAppController from "../controllers/WhatsAppController";
import { mediaUpload } from "../services/WhatsappService/uploadMediaAttachment";
import multer from "multer";
import uploadConfig from "../config/upload";
const whatsappRoutes = express.Router();
const upload = multer(uploadConfig);
whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);
whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);
whatsappRoutes.post("/facebook/", isAuth, WhatsAppController.storeFacebook);
whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);
whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);
whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  WhatsAppController.remove
);
whatsappRoutes.post(
  "/whatsapp/:whatsappId/media-upload",
  isAuth,
  upload.array("file"),
  mediaUpload
);
whatsappRoutes.post("/whatsapp-restart/", isAuth, WhatsAppController.restart);
export default whatsappRoutes;
