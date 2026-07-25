import { getDB } from "../db.js";

// Get all users
export const getUsers = async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.execute("SELECT id, username, email, role, status, createdAt FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Update user role and status
export const updateUser = async (req, res, next) => {
  try {
    const db = getDB();
    const { role, status } = req.body;
    const { id } = req.params;

    // Safety check: Cannot demote or suspend oneself
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role or suspend your own account."
      });
    }

    if (!role || !status) {
      return res.status(400).json({
        message: "Role and Status fields are required."
      });
    }

    await db.execute({
      sql: "UPDATE users SET role = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      args: [role, status, id]
    });

    res.json({ message: "User updated successfully!" });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Safety check: Cannot delete oneself
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account."
      });
    }

    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id]
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
