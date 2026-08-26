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
  getChildAssignments,
  deleteChildAssignments,
} from "../models/childModel";

import {
  deleteUser,
  getChildForUser,
  getLinkedChildrenForUser,
  getUserById,
  getUsersForChild,
  linkUserToChild,
} from "../models/userModel";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";


const parseOptionalId = (
  value: unknown
) => {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const id =
    Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return NaN;
  }

  return id;

};


export const fetchUsers = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    if (
      req.auth.role ===
        "therapist"
    ) {

      const children =
        await getLinkedChildrenForUser(
          req.auth.id
        );

      return res.json(
        children
      );

    }


    if (
      req.auth.role ===
        "admin"
    ) {

      const children =
        await getAllUsers();

      return res.json(
        children
      );

    }


    return res.status(403).json({
      message:
        "Access denied",
    });

  } catch (error) {

    console.error(
      "Fetch children error:",
      error
    );

    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchChildById = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid child ID",
      });

    }


    let child;


    if (
      req.auth.role ===
        "admin"
    ) {

      child =
        await getChildById(
          id
        );

    } else if (
      req.auth.role ===
        "therapist" ||
      req.auth.role ===
        "parent"
    ) {

      child =
        await getChildForUser(
          req.auth.id,
          id
        );

    } else {

      return res.status(403).json({
        message:
          "Access denied",
      });

    }


    if (!child) {

      return res.status(404).json({
        message:
          req.auth.role ===
            "admin"
            ? "Child not found"
            : "Child not found or not linked to this user",
      });

    }


    const assignments =
      await getChildAssignments(
        id
      );


    return res.json({
      ...child,
      assignments,
    });

  } catch (error) {

    console.error(
      "Fetch child error:",
      error
    );

    return res.status(500).json({
      message:
        "Server Error",
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
      parent_id,
      therapist_id,
    } = req.body;


    const numericAge =
      Number(age);


    const parentId =
      parseOptionalId(
        parent_id
      );


    const therapistId =
      parseOptionalId(
        therapist_id
      );


    if (
      Number.isNaN(parentId) ||
      Number.isNaN(therapistId)
    ) {

      return res.status(400).json({
        message:
          "Invalid parent or therapist ID",
      });

    }


    if (
      !full_name ||
      !String(full_name).trim() ||
      !Number.isInteger(
        numericAge
      ) ||
      numericAge <= 0 ||
      !gender ||
      !String(gender).trim() ||
      !region ||
      !String(region).trim()
    ) {

      return res.status(400).json({
        message:
          "Please provide all required fields",
      });

    }


    let resolvedParentName =
      parent_name
        ? String(
            parent_name
          ).trim()
        : "";


    if (
      parentId !== null
    ) {

      const parent =
        await getUserById(
          parentId
        );


      if (!parent) {

        return res.status(404).json({
          message:
            "Parent not found",
        });

      }


      if (
        parent.role !==
        "parent"
      ) {

        return res.status(400).json({
          message:
            "Selected user is not a parent",
        });

      }


      resolvedParentName =
        parent.full_name;

    }


    if (
      therapistId !== null
    ) {

      const therapist =
        await getUserById(
          therapistId
        );


      if (!therapist) {

        return res.status(404).json({
          message:
            "Therapist not found",
        });

      }


      if (
        therapist.role !==
        "therapist"
      ) {

        return res.status(400).json({
          message:
            "Selected user is not a therapist",
        });

      }

    }


    const result =
      await addChild(
        String(
          full_name
        ).trim(),
        numericAge,
        String(
          gender
        ).trim(),
        resolvedParentName,
        String(
          region
        ).trim(),
        notes
          ? String(
              notes
            ).trim()
          : ""
      );


    const childId =
      result.insertId;


    if (
      parentId !== null
    ) {

      await linkUserToChild(
        parentId,
        childId
      );

    }


    if (
      therapistId !== null
    ) {

      await linkUserToChild(
        therapistId,
        childId
      );

    }


    const child =
      await getChildById(
        childId
      );


    const assignments =
      await getChildAssignments(
        childId
      );


    return res.status(201).json({
      message:
        "Child added successfully",
      child: child
        ? {
            ...child,
            assignments,
          }
        : null,
    });

  } catch (error) {

    console.error(error);


    const message =
      error instanceof Error
        ? error.message
        : "Server Error";


    if (
      message ===
        "This child already has a parent" ||
      message ===
        "This child already has a therapist" ||
      message ===
        "Only parents and therapists can be linked to children"
    ) {

      return res.status(409).json({
        message,
      });

    }


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchChildDeleteInfo = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid child ID",
      });

    }


    const child =
      await getChildById(
        id
      );


    if (!child) {

      return res.status(404).json({
        message:
          "Child not found",
      });

    }


    const users =
      await getUsersForChild(
        id
      );


    const parent =
      users.find(
        user =>
          user.link_type ===
            "parent" ||
          user.role ===
            "parent"
      ) ?? null;


    let parentChildren:
      any[] = [];


    if (parent) {

      parentChildren =
        await getLinkedChildrenForUser(
          Number(
            parent.id
          )
        );

    }


    return res.json({
      child,
      parent,
      parent_children:
        parentChildren,
      parent_has_other_children:
        parentChildren.some(
          linkedChild =>
            Number(
              linkedChild.id
            ) !== id
        ),
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const removeChild = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid child ID",
      });

    }


    const child =
      await getChildById(
        id
      );


    if (!child) {

      return res.status(404).json({
        message:
          "Child not found",
      });

    }


    const deleteParent =
      req.body?.delete_parent ===
        true ||
      req.body?.delete_parent ===
        "true" ||
      req.query.delete_parent ===
        "true";


    const users =
      await getUsersForChild(
        id
      );


    const parent =
      users.find(
        user =>
          user.link_type ===
            "parent" ||
          user.role ===
            "parent"
      ) ?? null;


    await deleteChildAssignments(
      id
    );


    const result =
      await deleteChild(
        id
      );


    if (
      result.affectedRows ===
      0
    ) {

      return res.status(404).json({
        message:
          "Child not found",
      });

    }


    let parentDeleted =
      false;


    if (
      deleteParent &&
      parent
    ) {

      const deleted =
        await deleteUser(
          Number(
            parent.id
          )
        );

      parentDeleted =
        deleted > 0;

    }


    return res.json({
      message:
        "Child deleted successfully",
      child_id:
        id,
      parent_deleted:
        parentDeleted,
      deleted_parent_id:
        parentDeleted
          ? Number(
              parent?.id
            )
          : null,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const editChild = async (
  req: Request,
  res: Response
) => {

  try {

    const id =
      Number(
        req.params.id
      );


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
        message:
          "Invalid child ID",
      });

    }


    if (
      !full_name ||
      !String(full_name).trim() ||
      !Number.isInteger(
        numericAge
      ) ||
      numericAge <= 0 ||
      !gender ||
      !String(gender).trim() ||
      !region ||
      !String(region).trim()
    ) {

      return res.status(400).json({
        message:
          "Please provide all required fields",
      });

    }


    const existingChild =
      await getChildById(
        id
      );


    if (!existingChild) {

      return res.status(404).json({
        message:
          "Child not found",
      });

    }


    const affectedRows =
      await updateChildInDatabase(
        id,
        String(
          full_name
        ).trim(),
        numericAge,
        String(
          gender
        ).trim(),
        parent_name !==
          undefined &&
        parent_name !==
          null
          ? String(
              parent_name
            ).trim()
          : String(
              existingChild
                .parent_name ||
              ""
            ).trim(),
        String(
          region
        ).trim(),
        notes !==
          undefined &&
        notes !==
          null
          ? String(
              notes
            ).trim()
          : existingChild
              .notes ??
            null
      );


    if (
      affectedRows ===
      0
    ) {

      return res.status(404).json({
        message:
          "Child not found",
      });

    }


    const updatedChild =
      await getChildById(
        id
      );


    const assignments =
      await getChildAssignments(
        id
      );


    return res.json({
      message:
        "Child updated successfully",
      child: updatedChild
        ? {
            ...updatedChild,
            assignments,
          }
        : null,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const editParentChild = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    if (
      req.auth.role !==
      "parent"
    ) {

      return res.status(403).json({
        message:
          "Parent access required",
      });

    }


    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid child ID",
      });

    }


    const parent =
      await getUserById(
        req.auth.id
      );


    if (!parent) {

      return res.status(404).json({
        message:
          "Parent account not found",
      });

    }


    if (
      Number(
        parent.is_active
      ) !== 1
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const child =
      await getChildForUser(
        req.auth.id,
        id
      );


    if (!child) {

      return res.status(404).json({
        message:
          "Child not found or not linked to this parent",
      });

    }


    const {
      full_name,
      age,
      gender,
      region,
    } = req.body;


    const numericAge =
      Number(age);


    if (
      !full_name ||
      !String(full_name).trim() ||
      !Number.isInteger(
        numericAge
      ) ||
      numericAge <= 0 ||
      !gender ||
      !String(gender).trim() ||
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
        String(
          full_name
        ).trim(),
        numericAge,
        String(
          gender
        ).trim(),
        String(
          child.parent_name ||
          parent.full_name ||
          ""
        ).trim(),
        String(
          region
        ).trim(),
        child.notes ?? null
      );


    if (
      affectedRows ===
      0
    ) {

      return res.status(404).json({
        message:
          "Child not found",
      });

    }


    const updatedChild =
      await getChildById(
        id
      );


    return res.json({
      message:
        "Child updated successfully",
      child:
        updatedChild,
    });

  } catch (error) {

    console.error(
      "Parent child update error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};