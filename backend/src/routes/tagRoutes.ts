import express from "express";
import isAuth from "../middleware/isAuth";
import * as TagController from "../controllers/TagController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);
const tagRoutes = express.Router();
tagRoutes.get("/tags/list", isAuth, TagController.list);
tagRoutes.get("/tags", isAuth, TagController.index);
tagRoutes.post("/tags", isAuth, TagController.store);
tagRoutes.get("/tags/kanban", isAuth, TagController.kanban);
tagRoutes.put("/tags/:tagId", isAuth, TagController.update);
tagRoutes.get("/tags/:tagId", isAuth, TagController.show);
tagRoutes.delete("/tags/:tagId", isAuth, TagController.remove);
tagRoutes.post("/tags/sync", isAuth, TagController.syncTags);
tagRoutes.post("/tags/:id/media-upload", isAuth, upload.array("file"), TagController.mediaUpload);
tagRoutes.delete("/tags/:id/media-upload", isAuth, TagController.deleteMedia);
export default tagRoutes;
