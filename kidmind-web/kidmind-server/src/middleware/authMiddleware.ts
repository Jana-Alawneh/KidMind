import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import type {
  UserRole,
} from "../models/userModel";


interface TokenPayload {
  id: number;
  role: UserRole;
}


export interface AuthenticatedRequest
  extends Request {
  auth?: TokenPayload;
}


const allowedRoles: UserRole[] = [
  "admin",
  "therapist",
  "parent",
];


export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {

  try {

    const authorization =
      req.headers.authorization;


    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const token =
      authorization
        .slice(7)
        .trim();


    if (!token) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    const secret =
      process.env.JWT_SECRET ||
      "kidmind-development-secret";


    const decoded =
      jwt.verify(
        token,
        secret
      ) as TokenPayload;


    const userId =
      Number(decoded.id);

    const role =
      decoded.role;


    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !allowedRoles.includes(role)
    ) {

      return res.status(401).json({
        message:
          "Invalid authentication token",
      });

    }


    req.auth = {
      id: userId,
      role,
    };


    return next();

  } catch {

    return res.status(401).json({
      message:
        "Invalid or expired token",
    });

  }

};


export const authorizeRoles = (
  ...roles: UserRole[]
) => {

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {

    if (!req.auth) {

      return res.status(401).json({
        message:
          "Authentication required",
      });

    }


    if (
      !roles.includes(
        req.auth.role
      )
    ) {

      return res.status(403).json({
        message:
          "You do not have permission to perform this action",
      });

    }


    return next();

  };

};