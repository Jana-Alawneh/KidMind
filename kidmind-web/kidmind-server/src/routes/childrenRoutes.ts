import { Router } from "express";

import {
  fetchUsers,
  fetchChildById,
  createChild,
  removeChild,
  editChild,
} from "../controllers/childController";


const router = Router();


router.get("/", fetchUsers);


router.get("/:id", fetchChildById);


router.post("/", createChild);


router.put("/:id", editChild);


router.delete("/:id", removeChild);


export default router;