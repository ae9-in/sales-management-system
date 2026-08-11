import express from "express";
import { getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticateToken, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, requireSuperAdmin, getUsers);
router.put("/:id", authenticateToken, requireSuperAdmin, updateUser);
router.delete("/:id", authenticateToken, requireSuperAdmin, deleteUser);

export default router;
