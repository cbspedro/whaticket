import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as SettingController from "../controllers/SettingController";
const settingRoutes = Router();
settingRoutes.get("/settings", isAuth, SettingController.index);
settingRoutes.get("/settings/:settingKey", isAuth, SettingController.showOne);
settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);
export default settingRoutes;
