import express from "express";
import TaskController from "../controllers/TaskController";
import isAuth from "../middleware/isAuth";
const router = express.Router();
router.post("/tasks", isAuth, TaskController.createTask);
router.get("/tasks", isAuth, TaskController.getAllTasks);
router.get("/tasks/:taskId", isAuth, TaskController.getTaskById);
router.put("/tasks/:taskId", isAuth, TaskController.updateTask);
router.delete("/tasks/:taskId", isAuth, TaskController.deleteTask);
router.put(
  "/tasks/:taskId/description",
  isAuth,
  TaskController.updateTaskDescription
);
export default router;
