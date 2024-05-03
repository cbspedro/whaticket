import { Request, Response } from "express";
import TaskService from "../services/TaskService/taskService";
const TaskController = {
  createTask: async (req: Request, res: Response) => {
    try {
      const { text, description } = req.body;
      const companyId = req.user.companyId;
      const task = await TaskService.createTask(text, description, companyId);
      return res.status(201).json(task);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar a tarefa." });
    }
  },
  getAllTasks: async (req: Request, res: Response) => {
    try {
      const companyId = req.user.companyId;
      const tasks = await TaskService.getAllTasks(companyId);
      return res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar tarefas." });
    }
  },
  getTaskById: async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const companyId = req.user.companyId;
      const task = await TaskService.getTaskById(taskId, companyId);
      if (!task) {
        return res.status(404).json({ error: "Tarefa não encontrada." });
      }
      return res.status(200).json(task);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar a tarefa." });
    }
  },
  updateTask: async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const { text } = req.body;
      const companyId = req.user.companyId;
      const updatedTask = await TaskService.updateTask(taskId, text, companyId);
      if (!updatedTask) {
        return res.status(404).json({ error: "Tarefa não encontrada." });
      }
      return res.status(200).json(updatedTask);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar a tarefa." });
    }
  },
  deleteTask: async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const companyId = req.user.companyId;
      const deletedTask = await TaskService.deleteTask(taskId, companyId);
      if (!deletedTask) {
        return res.status(404).json({ error: "Tarefa não encontrada." });
      }
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao excluir a tarefa." });
    }
  },
  updateTaskDescription: async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const { description } = req.body;
      const companyId = req.user.companyId;
      const updatedTask = await TaskService.updateTaskDescription(
        taskId,
        description,
        companyId
      );
      if (!updatedTask) {
        return res.status(404).json({ error: "Tarefa não encontrada." });
      }
      return res
        .status(200)
        .json({ message: "Descrição da tarefa atualizada com sucesso" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar a descrição da tarefa." });
    }
  }
};
export default TaskController;
