import express from "express";
import { getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, requireAdmin, getUsers);
router.put("/:id", authenticateToken, requireAdmin, updateUser);
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

export default router;
