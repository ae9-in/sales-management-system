import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { validateEmployee } from "../middleware/validation.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getEmployees);
router.post("/", authenticateToken, requireAdmin, validateEmployee, createEmployee);
router.put("/:id", authenticateToken, requireAdmin, validateEmployee, updateEmployee);
router.delete("/:id", authenticateToken, requireAdmin, deleteEmployee);

export default router;