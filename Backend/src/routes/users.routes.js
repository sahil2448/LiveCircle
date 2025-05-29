import { Router } from "express";
import {
  addToHistory,
  deleteFromHistory,
  getUserHistory,
  register,
} from "../controllers/user.controller.js";
import { login } from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/delete_from_history").delete(deleteFromHistory);

export default router;
