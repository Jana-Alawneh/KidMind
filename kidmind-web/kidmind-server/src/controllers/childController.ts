import { Request, Response } from "express";

import {
  getAllUsers,
  addChild,
  deleteChild,
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