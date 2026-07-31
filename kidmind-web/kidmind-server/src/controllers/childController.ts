import { Request, Response } from "express";

import {
  getAllUsers,
  addChild,
  deleteChild,
  updateChild as updateChildInDatabase,
} from "../models/userModel";

export const fetchUsers = async (
  req: Request,
  res: Response
) => {
  try {

    const users = await getAllUsers();

    res.json(users);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

export const createChild = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      full_name,
      age,
      gender,
      parent_name,
      notes,
    } = req.body;

    await addChild(
      full_name,
      age,
      gender,
      parent_name,
      notes
    );

    res.status(201).json({
      message: "Child added successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

};

export const removeChild = async (
  req: Request,
  res: Response
) => {

  try {

    const { id } = req.params;

    await deleteChild(Number(id));


    res.json({
      message: "Child deleted successfully",
    });


  } catch(error){

    console.error(error);

    res.status(500).json({
      message:"Server Error"
    });

  }

};

export const editChild = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const {
      full_name,
      age,
      gender,
      parent_name,
      notes,
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid child ID",
      });
    }

    if (
      !full_name ||
      age === undefined ||
      !gender ||
      !parent_name
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const affectedRows =
      await updateChildInDatabase(
        id,
        full_name,
        Number(age),
        gender,
        parent_name,
        notes ?? null
      );

    if (affectedRows === 0) {
      return res.status(404).json({
        message: "Child not found",
      });
    }

    return res.json({
      message: "Child updated successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};