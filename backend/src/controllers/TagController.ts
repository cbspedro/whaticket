import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import CreateService from "../services/TagServices/CreateService";
import ListService from "../services/TagServices/ListService";
import UpdateService from "../services/TagServices/UpdateService";
import ShowService from "../services/TagServices/ShowService";
import DeleteService from "../services/TagServices/DeleteService";
import SimpleListService from "../services/TagServices/SimpleListService";
import SyncTagService from "../services/TagServices/SyncTagsService";
import fs from "fs";
import path from "path";
import { head } from "lodash";
import KanbanListService from "../services/TagServices/KanbanListService";
import Tag from "../models/Tag";
type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
  kanban?: number;
  actCamp?: number;
};
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam, kanban, actCamp } = req.query as IndexQuery;
  const { companyId } = req.user;
  const { tags, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId,
    kanban,
    actCamp
  });
  return res.json({ tags, count, hasMore });
};
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, kanban, actCamp } = req.body;
  const { companyId } = req.user;
  const tag = await CreateService({ name, color, kanban, companyId, actCamp });
  const io = getIO();
  io.emit("tag", { action: "create", tag });
  return res.status(200).json(tag);
};
export const kanban = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const tags = await KanbanListService({ companyId });
  return res.json({ lista: tags });
};
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;
  const tag = await ShowService(tagId);
  return res.status(200).json(tag);
};
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tagId } = req.params;
  const tagData = req.body;
  const tag = await UpdateService({ tagData, id: tagId });
  const io = getIO();
  io.emit("tag", { action: "update", tag });
  return res.status(200).json(tag);
};
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tagId } = req.params;
  await DeleteService(tagId);
  const io = getIO();
  io.emit("tag", { action: "delete", tagId });
  return res.status(200).json({ message: "Tag deleted" });
};
export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;
  const tags = await SimpleListService({ searchParam, companyId });
  return res.json(tags);
};
export const syncTags = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body;
  const { companyId } = req.user;
  const tags = await SyncTagService({ ...data, companyId });
  return res.json(tags);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    const schedule = await Tag.findByPk(id);
    schedule.mediaPath = file.filename;
    schedule.mediaName = file.originalname;

    await schedule.save();
    return res.send({ mensagem: "Arquivo Anexado" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const schedule = await Tag.findByPk(id);
    const filePath = path.resolve("public", schedule.mediaPath);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      fs.unlinkSync(filePath);
    }
    schedule.mediaPath = null;
    schedule.mediaName = null;
    await schedule.save();
    return res.send({ mensagem: "Arquivo Excluído" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
