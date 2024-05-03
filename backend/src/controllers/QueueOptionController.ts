import { Request, Response } from "express";
import CreateService from "../services/QueueOptionService/CreateService";
import ListService from "../services/QueueOptionService/ListService";
import UpdateService from "../services/QueueOptionService/UpdateService";
import ShowService from "../services/QueueOptionService/ShowService";
import DeleteService from "../services/QueueOptionService/DeleteService";
import { log } from "console";
import multer from "multer";
import uploadConfig from "../config/upload";
import QueueOption from "../models/QueueOption";
import fs from "fs";
import Chatbot from "../models/Chatbot";
type FilterList = {
  queueId: string | number;
  queueOptionId: string | number;
  parentId: string | number | boolean;
};
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { queueId, queueOptionId, parentId } = req.query as FilterList;
  const queueOptions = await ListService({ queueId, queueOptionId, parentId });
  return res.json(queueOptions);
};
export const uploadFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueOptionId } = req.params;
  const queueOptionData = req.body;
  const file = req.file as Express.Multer.File;
  const chatbot = await Chatbot.findByPk(queueOptionId);
  if (!chatbot) {
    throw new Error("chatbot not found");
  }
  const oldFile = chatbot.greetingMessage;
  if (fs.existsSync(oldFile)) {
    fs.unlinkSync(oldFile);
  }
  chatbot.greetingMessage = file.filename;
  chatbot.optionType = "file";
  await chatbot.save();
  return res.status(200).json({ message: "Option Updated" });
};
export const store = async (req: Request, res: Response): Promise<Response> => {
  const queueOptionData = req.body;
  const queueOption = await CreateService(queueOptionData);
  return res.status(200).json(queueOption);
};
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { queueOptionId } = req.params;
  const queueOption = await ShowService(queueOptionId);
  return res.status(200).json(queueOption);
};
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueOptionId } = req.params;
  const queueOptionData = req.body;
  const queueOption = await UpdateService(queueOptionId, queueOptionData);
  return res.status(200).json(queueOption);
};
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueOptionId } = req.params;
  const queueOption = await QueueOption.findByPk(queueOptionId);
  if (!queueOption) {
    throw new Error("QueueOption not found");
  }
  const oldFile = queueOption.message;
  if (fs.existsSync(oldFile)) {
    fs.unlinkSync(oldFile);
  }
  await DeleteService(queueOptionId);
  return res.status(200).json({ message: "Option Delected" });
};
