import { Router } from "express";

import {
  fetchUsers,
  createChild,
  removeChild,
} from "../controllers/userController";


const router = Router();


router.get("/", fetchUsers);


router.post("/", createChild);


router.delete("/:id", removeChild);


export default router;