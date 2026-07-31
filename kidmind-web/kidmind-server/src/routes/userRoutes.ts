import { Router } from "express";

import {
  fetchUsers,
  createChild,
  removeChild,
  editChild,
} from "../controllers/userController";


const router = Router();


router.get("/", fetchUsers);


router.post("/", createChild);


router.put("/:id", editChild);


router.delete("/:id", removeChild);


export default router;