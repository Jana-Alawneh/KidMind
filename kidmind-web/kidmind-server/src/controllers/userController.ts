import {
  Request,
  Response,
} from "express";

import {
  getAllUsers,
  getChildById,
  addChild,
  deleteChild,
  updateChild as updateChildInDatabase,
} from "../models/childModel";


export const fetchUsers = async (
  req: Request,
  res: Response
) => {

  try {

    const users =
      await getAllUsers();

    return res.json(users);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const fetchChildById = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid child ID",
      });

    }


    const child =
      await getChildById(id);


    if (!child) {

      return res.status(404).json({
        message: "Child not found",
      });

    }


    return res.json(child);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
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
      region,
      notes,
    } = req.body;


    const numericAge =
      Number(age);


    if (
      !full_name ||
      !String(full_name).trim() ||
      !Number.isInteger(numericAge) ||
      numericAge <= 0 ||
      !gender ||
      !String(gender).trim() ||
      !parent_name ||
      !String(parent_name).trim() ||
      !region ||
      !String(region).trim()
    ) {

      return res.status(400).json({
        message:
          "Please provide all required fields",
      });

    }


    await addChild(
      String(full_name).trim(),
      numericAge,
      String(gender).trim(),
      String(parent_name).trim(),
      String(region).trim(),
      notes
        ? String(notes).trim()
        : ""
    );


    return res.status(201).json({
      message:
        "Child added successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const removeChild = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid child ID",
      });

    }


    await deleteChild(id);


    return res.json({
      message:
        "Child deleted successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });

  }

};


export const editChild = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(req.params.id);


    const {
      full_name,
      age,
      gender,
      parent_name,
      region,
      notes,
    } = req.body;


    const numericAge =
      Number(age);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message: "Invalid child ID",
      });

    }


    if (
      !full_name ||
      !String(full_name).trim() ||
      !Number.isInteger(numericAge) ||
      numericAge <= 0 ||
      !gender ||
      !String(gender).trim() ||
      !parent_name ||
      !String(parent_name).trim() ||
      !region ||
      !String(region).trim()
    ) {

      return res.status(400).json({
        message:
          "Please provide all required fields",
      });

    }


    const affectedRows =
      await updateChildInDatabase(
        id,
        String(full_name).trim(),
        numericAge,
        String(gender).trim(),
        String(parent_name).trim(),
        String(region).trim(),
        notes
          ? String(notes).trim()
          : null
      );


    if (
      affectedRows === 0
    ) {

      return res.status(404).json({
        message: "Child not found",
      });

    }


    return res.json({
      message:
        "Child updated successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });

  }

};