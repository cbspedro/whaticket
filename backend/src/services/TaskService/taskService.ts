import Task from "../../models/Task";
import { FindOptions, Model } from "sequelize/types";
const TaskService = {
  createTask: async (text: string, description: string, companyId: number) => {
    try {
      const task = await Task.create({ text, description, companyId });
      return task;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao criar a tarefa.");
    }
  },
  getAllTasks: async (companyId: number) => {
    try {
      const tasks = await Task.findAll({ where: { companyId } } as FindOptions);
      return tasks;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao buscar tarefas.");
    }
  },
  getTaskById: async (taskId: string, companyId: number) => {
    try {
      const task = await Task.findByPk(taskId, {
        where: { companyId }
      } as FindOptions);
      if (!task) {
        return null;
      }
      return task;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao buscar a tarefa.");
    }
  },
  updateTask: async (
    taskId: string,
    text: string | undefined,
    companyId: number
  ) => {
    try {
      const task = await Task.findByPk(taskId, {
        where: { companyId }
      } as FindOptions);
      if (!task) {
        return null;
      }
      if (text !== undefined) {
        task.text = text;
      }
      await task.save();
      return task;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao atualizar a tarefa.");
    }
  },
  deleteTask: async (taskId: string, companyId: number) => {
    try {
      const task = await Task.findByPk(taskId, {
        where: { companyId }
      } as FindOptions);
      if (!task) {
        return false;
      }
      await task.destroy();
      return true;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao excluir a tarefa.");
    }
  },
  updateTaskDescription: async (
    taskId: string,
    description: string,
    companyId: number
  ) => {
    try {
      const task = await Task.findByPk(taskId, {
        where: { companyId }
      } as FindOptions);
      if (!task) {
        return null;
      }
      console.log("Descrição recebida:", description);
      task.description = description;
      await task.save();
      console.log("Descrição após atualização:", task.description);
      return task;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao atualizar a descrição da tarefa.");
    }
  }
};
export default TaskService;
