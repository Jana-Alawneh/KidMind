import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  createUser,
  deleteAllAssignmentsForUser,
  deleteUser,
  getAdminSettingsSummary,
  getAllChildAssignments,
  getAllUsers,
  getAvailableChildrenForRole,
  getChildForUser,
  getChildrenForUser,
  getLinkedChildrenForUser,
  getOrCreateUserSettings,
  getSelectedLinkedChildren,
  getTherapistsForUserChildren,
  getUserByEmail,
  getUserById,
  getUsersForChild,
  linkUserToChild,
  unlinkUserFromChild,
  updateLastLogin,
  updateOwnUserProfile,
  updateUserActiveStatus,
  updateUserByAdmin,
  updateUserPassword,
  updateUserSettings,
  type AppearanceMode,
  type ChildLinkType,
  type UserRole,
} from "../models/userModel";

import {
  deleteChild,
  deleteChildAssignments,
  getChildById,
  updateChild as updateChildInDatabase,
} from "../models/childModel";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";


const allowedRoles: UserRole[] = [
  "therapist",
  "parent",
  "admin",
];


const allowedLinkTypes: ChildLinkType[] = [
  "parent",
  "therapist",
];


const createToken = (
  id: number,
  role: UserRole
) => {

  const secret =
    process.env.JWT_SECRET ||
    "kidmind-development-secret";

  return jwt.sign(
    {
      id,
      role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );

};


const sanitizeParentChild = (
  child: any
) => {

  const {
    notes,
    ...safeChild
  } = child;

  return safeChild;

};


const parsePositiveIds = (
  value: unknown
) => {

  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(
          item =>
            Number(item)
        )
        .filter(
          item =>
            Number.isInteger(item) &&
            item > 0
        )
    )
  );

};


const clearLegacyParentName = async (
  childId: number
) => {

  const child =
    await getChildById(
      childId
    );

  if (!child) {
    return;
  }

  await updateChildInDatabase(
    childId,
    String(
      child.full_name ||
      ""
    ).trim(),
    Number(
      child.age
    ),
    String(
      child.gender ||
      ""
    ).trim(),
    "",
    child.region
      ? String(
          child.region
        ).trim()
      : null,
    child.notes ?? null
  );

};


const syncLegacyParentName = async (
  childId: number,
  parentName: string
) => {

  const child =
    await getChildById(
      childId
    );

  if (!child) {
    return;
  }

  await updateChildInDatabase(
    childId,
    String(
      child.full_name ||
      ""
    ).trim(),
    Number(
      child.age
    ),
    String(
      child.gender ||
      ""
    ).trim(),
    parentName.trim(),
    child.region
      ? String(
          child.region
        ).trim()
      : null,
    child.notes ?? null
  );

};


export const registerUser = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      full_name,
      email,
      password,
      role,
      phone,
      region,
    } = req.body;


    const normalizedName =
      String(
        full_name || ""
      ).trim();


    const normalizedEmail =
      String(
        email || ""
      )
        .trim()
        .toLowerCase();


    const normalizedPassword =
      String(
        password || ""
      );


    const normalizedRole =
      String(
        role || ""
      )
        .trim()
        .toLowerCase() as UserRole;


    const normalizedPhone =
      phone
        ? String(
            phone
          ).trim()
        : null;


    const normalizedRegion =
      region
        ? String(
            region
          ).trim()
        : null;


    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPassword ||
      !allowedRoles.includes(
        normalizedRole
      )
    ) {

      return res.status(400).json({
        message:
          "Please provide valid user information",
      });

    }


    if (
      normalizedRole ===
        "parent" &&
      !normalizedRegion
    ) {

      return res.status(400).json({
        message:
          "Region is required for parents",
      });

    }


    if (
      normalizedPassword.length < 6
    ) {

      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });

    }


    const existingUser =
      await getUserByEmail(
        normalizedEmail
      );


    if (existingUser) {

      return res.status(409).json({
        message:
          "Email already exists",
      });

    }


    const passwordHash =
      await bcrypt.hash(
        normalizedPassword,
        12
      );


    const result =
      await createUser(
        normalizedName,
        normalizedEmail,
        passwordHash,
        normalizedRole,
        normalizedPhone,
        null,
        normalizedRegion
      );


    const user =
      await getUserById(
        result.insertId
      );


    if (!user) {

      return res.status(500).json({
        message:
          "Failed to create user",
      });

    }


    return res.status(201).json({
      message:
        "User registered successfully",
      user: {
        id:
          user.id,
        full_name:
          user.full_name,
        email:
          user.email,
        role:
          user.role,
        phone:
          user.phone,
        region:
          user.region,
        avatar_url:
          user.avatar_url,
        is_active:
          user.is_active,
      },
    });

  } catch (error) {

    console.error(
      "Register user error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const loginUser = async (
  req: Request,
  res: Response
) => {

  try {

    const normalizedEmail =
      String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();


    const password =
      String(
        req.body.password || ""
      );


    if (
      !normalizedEmail ||
      !password
    ) {

      return res.status(400).json({
        message:
          "Email and password are required",
      });

    }


    const user =
      await getUserByEmail(
        normalizedEmail
      );


    if (!user) {

      return res.status(401).json({
        message:
          "Invalid email or password",
      });

    }


    if (!user.is_active) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );


    if (!passwordMatches) {

      return res.status(401).json({
        message:
          "Invalid email or password",
      });

    }


    await updateLastLogin(
      user.id
    );


    const token =
      createToken(
        user.id,
        user.role
      );


    return res.json({
      message:
        "Login successful",
      token,
      user: {
        id:
          user.id,
        full_name:
          user.full_name,
        email:
          user.email,
        role:
          user.role,
        phone:
          user.phone,
        region:
          user.region,
        avatar_url:
          user.avatar_url,
        is_active:
          user.is_active,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchCurrentUser = async (
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


    const user =
      await getUserById(
        req.auth.id
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (!user.is_active) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    return res.json({
      user: {
        id:
          user.id,
        full_name:
          user.full_name,
        email:
          user.email,
        role:
          user.role,
        phone:
          user.phone,
        region:
          user.region,
        avatar_url:
          user.avatar_url,
        is_active:
          user.is_active,
        last_login_at:
          user.last_login_at,
        created_at:
          user.created_at,
      },
    });

  } catch (error) {

    console.error(
      "Fetch current user error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchSettings = async (
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


    const user =
      await getUserById(
        req.auth.id
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (!user.is_active) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const settings =
      await getOrCreateUserSettings(
        user.id
      );


    let roleInfo:
      Record<string, unknown>;


    if (
      user.role ===
      "admin"
    ) {

      const summary =
        await getAdminSettingsSummary();

      roleInfo = {
        type:
          "admin",
        system: {
          name:
            "KIDMIND",
          version:
            process.env.APP_VERSION ||
            "1.0.0",
        },
        summary,
      };

    } else {

      const children =
        await getLinkedChildrenForUser(
          user.id
        );

      const safeChildren =
        user.role ===
        "parent"
          ? children.map(
              sanitizeParentChild
            )
          : children;

      roleInfo = {
        type:
          user.role,
        child_count:
          safeChildren.length,
        children:
          safeChildren,
      };

    }


    return res.json({
      user: {
        id:
          user.id,
        full_name:
          user.full_name,
        email:
          user.email,
        role:
          user.role,
        phone:
          user.phone,
        region:
          user.region,
        avatar_url:
          user.avatar_url,
        is_active:
          Boolean(
            user.is_active
          ),
        last_login_at:
          user.last_login_at,
        created_at:
          user.created_at,
      },
      settings: {
        email_notifications:
          Boolean(
            settings
              ?.email_notifications
          ),
        account_notifications:
          Boolean(
            settings
              ?.account_notifications
          ),
        session_notifications:
          Boolean(
            settings
              ?.session_notifications
          ),
        progress_notifications:
          Boolean(
            settings
              ?.progress_notifications
          ),
        appearance:
          settings?.appearance ||
          "system",
      },
      role_info:
        roleInfo,
    });

  } catch (error) {

    console.error(
      "Fetch settings error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const updateCurrentUserProfile = async (
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


    const user =
      await getUserById(
        req.auth.id
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (!user.is_active) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const fullName =
      String(
        req.body.full_name ||
        ""
      ).trim();


    const email =
      String(
        req.body.email ||
        ""
      )
        .trim()
        .toLowerCase();


    const phone =
      req.body.phone
        ? String(
            req.body.phone
          ).trim()
        : null;


    const avatarUrl =
      req.body.avatar_url ===
        undefined
        ? user.avatar_url
        : req.body.avatar_url
          ? String(
              req.body.avatar_url
            ).trim()
          : null;


    const region =
      req.body.region ===
        undefined
        ? undefined
        : req.body.region
          ? String(
              req.body.region
            ).trim()
          : null;


    if (
      !fullName ||
      !email
    ) {

      return res.status(400).json({
        message:
          "Full name and email are required",
      });

    }


    const finalRegion =
      region ===
        undefined
        ? user.region
        : region;


    if (
      user.role ===
        "parent" &&
      !finalRegion
    ) {

      return res.status(400).json({
        message:
          "Region is required for parents",
      });

    }


    const existingEmailUser =
      await getUserByEmail(
        email
      );


    if (
      existingEmailUser &&
      Number(
        existingEmailUser.id
      ) !==
        Number(
          user.id
        )
    ) {

      return res.status(409).json({
        message:
          "Email already exists",
      });

    }


    await updateOwnUserProfile(
      user.id,
      fullName,
      email,
      phone,
      avatarUrl,
      finalRegion
    );


    if (
      user.role ===
      "parent" &&
      user.full_name !==
        fullName
    ) {

      const children =
        await getLinkedChildrenForUser(
          user.id
        );

      for (
        const child of
        children
      ) {

        await syncLegacyParentName(
          Number(
            child.id
          ),
          fullName
        );

      }

    }


    const updatedUser =
      await getUserById(
        user.id
      );


    if (!updatedUser) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    return res.json({
      message:
        "Profile updated successfully",
      user: {
        id:
          updatedUser.id,
        full_name:
          updatedUser.full_name,
        email:
          updatedUser.email,
        role:
          updatedUser.role,
        phone:
          updatedUser.phone,
        region:
          updatedUser.region,
        avatar_url:
          updatedUser.avatar_url,
        is_active:
          Boolean(
            updatedUser.is_active
          ),
      },
    });

  } catch (error) {

    console.error(
      "Update current user profile error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const changeCurrentUserPassword = async (
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


    const user =
      await getUserById(
        req.auth.id
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (!user.is_active) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const currentPassword =
      String(
        req.body.current_password ||
        ""
      );


    const newPassword =
      String(
        req.body.new_password ||
        ""
      );


    const confirmPassword =
      req.body.confirm_password ===
        undefined
        ? null
        : String(
            req.body.confirm_password
          );


    if (
      !currentPassword ||
      !newPassword
    ) {

      return res.status(400).json({
        message:
          "Current password and new password are required",
      });

    }


    if (
      newPassword.length < 6
    ) {

      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });

    }


    if (
      confirmPassword !==
        null &&
      newPassword !==
        confirmPassword
    ) {

      return res.status(400).json({
        message:
          "Password confirmation does not match",
      });

    }


    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password_hash
      );


    if (!passwordMatches) {

      return res.status(400).json({
        message:
          "Current password is incorrect",
      });

    }


    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password_hash
      );


    if (samePassword) {

      return res.status(400).json({
        message:
          "New password must be different from current password",
      });

    }


    const passwordHash =
      await bcrypt.hash(
        newPassword,
        12
      );


    await updateUserPassword(
      user.id,
      passwordHash
    );


    return res.json({
      message:
        "Password changed successfully",
    });

  } catch (error) {

    console.error(
      "Change password error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const updateCurrentUserSettings = async (
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


    const user =
      await getUserById(
        req.auth.id
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (!user.is_active) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const currentSettings =
      await getOrCreateUserSettings(
        user.id
      );


    const appearance =
      req.body.appearance ===
        undefined
        ? (
            currentSettings
              ?.appearance ||
            "system"
          )
        : String(
            req.body.appearance
          )
            .trim()
            .toLowerCase() as
              AppearanceMode;


    const allowedAppearances:
      AppearanceMode[] = [
        "system",
        "light",
        "dark",
      ];


    if (
      !allowedAppearances.includes(
        appearance
      )
    ) {

      return res.status(400).json({
        message:
          "Appearance must be system, light, or dark",
      });

    }


    const readBoolean = (
      value: unknown,
      fallback: boolean
    ) => {

      if (
        value === undefined
      ) {
        return fallback;
      }

      if (
        typeof value !==
        "boolean"
      ) {
        return null;
      }

      return value;

    };


    const emailNotifications =
      readBoolean(
        req.body
          .email_notifications,
        Boolean(
          currentSettings
            ?.email_notifications
        )
      );


    const accountNotifications =
      readBoolean(
        req.body
          .account_notifications,
        Boolean(
          currentSettings
            ?.account_notifications
        )
      );


    const sessionNotifications =
      readBoolean(
        req.body
          .session_notifications,
        Boolean(
          currentSettings
            ?.session_notifications
        )
      );


    const progressNotifications =
      readBoolean(
        req.body
          .progress_notifications,
        Boolean(
          currentSettings
            ?.progress_notifications
        )
      );


    if (
      emailNotifications ===
        null ||
      accountNotifications ===
        null ||
      sessionNotifications ===
        null ||
      progressNotifications ===
        null
    ) {

      return res.status(400).json({
        message:
          "Notification settings must be true or false",
      });

    }


    await updateUserSettings(
      user.id,
      emailNotifications,
      accountNotifications,
      sessionNotifications,
      progressNotifications,
      appearance
    );


    const updatedSettings =
      await getOrCreateUserSettings(
        user.id
      );


    return res.json({
      message:
        "Settings updated successfully",
      settings: {
        email_notifications:
          Boolean(
            updatedSettings
              ?.email_notifications
          ),
        account_notifications:
          Boolean(
            updatedSettings
              ?.account_notifications
          ),
        session_notifications:
          Boolean(
            updatedSettings
              ?.session_notifications
          ),
        progress_notifications:
          Boolean(
            updatedSettings
              ?.progress_notifications
          ),
        appearance:
          updatedSettings
            ?.appearance ||
          "system",
      },
    });

  } catch (error) {

    console.error(
      "Update settings error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchParentChildren = async (
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
      !parent.is_active
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const children =
      await getChildrenForUser(
        req.auth.id
      );


    return res.json(
      children.map(
        sanitizeParentChild
      )
    );

  } catch (error) {

    console.error(
      "Fetch parent children error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchParentChild = async (
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


    const childId =
      Number(
        req.params.childId
      );


    if (
      !Number.isInteger(
        childId
      ) ||
      childId <= 0
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
      !parent.is_active
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const child =
      await getChildForUser(
        req.auth.id,
        childId
      );


    if (!child) {

      return res.status(404).json({
        message:
          "Child not found or not linked to this parent",
      });

    }


    return res.json(
      sanitizeParentChild(
        child
      )
    );

  } catch (error) {

    console.error(
      "Fetch parent child error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchParentTherapists = async (
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
      !parent.is_active
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    const therapists =
      await getTherapistsForUserChildren(
        req.auth.id
      );


    return res.json(
      therapists
    );

  } catch (error) {

    console.error(
      "Fetch parent therapists error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchUsers = async (
  req: Request,
  res: Response
) => {

  try {

    const users =
      await getAllUsers();


    return res.json(
      users
    );

  } catch (error) {

    console.error(
      "Fetch users error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchAssignableParents = async (
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


    const currentUser =
      await getUserById(
        req.auth.id
      );


    if (!currentUser) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (
      !currentUser.is_active
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    if (
      currentUser.role !==
        "admin" &&
      currentUser.role !==
        "therapist"
    ) {

      return res.status(403).json({
        message:
          "Access denied",
      });

    }


    const users =
      await getAllUsers();


    const parents =
      users
        .filter(
          user =>
            user.role ===
              "parent" &&
            Number(
              user.is_active
            ) === 1
        )
        .map(
          user => ({
            id:
              user.id,
            full_name:
              user.full_name,
            email:
              user.email,
            role:
              user.role,
            phone:
              user.phone,
            region:
              user.region,
            avatar_url:
              user.avatar_url,
            is_active:
              Boolean(
                user.is_active
              ),
          })
        );


    return res.json(
      parents
    );

  } catch (error) {

    console.error(
      "Fetch assignable parents error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchAvailableChildren = async (
  req: Request,
  res: Response
) => {

  try {

    const linkType =
      String(
        req.query.link_type ||
        ""
      )
        .trim()
        .toLowerCase() as ChildLinkType;


    if (
      !allowedLinkTypes.includes(
        linkType
      )
    ) {

      return res.status(400).json({
        message:
          "link_type must be parent or therapist",
      });

    }


    let currentUserId:
      number | null =
        null;


    if (
      req.query.user_id !==
        undefined &&
      req.query.user_id !==
        null &&
      String(
        req.query.user_id
      ).trim() !==
        ""
    ) {

      const parsedUserId =
        Number(
          req.query.user_id
        );


      if (
        !Number.isInteger(
          parsedUserId
        ) ||
        parsedUserId <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid user ID",
        });

      }


      const user =
        await getUserById(
          parsedUserId
        );


      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }


      if (
        user.role !==
        linkType
      ) {

        return res.status(400).json({
          message:
            "User role does not match link type",
        });

      }


      currentUserId =
        parsedUserId;

    }


    const children =
      await getAvailableChildrenForRole(
        linkType,
        currentUserId
      );


    return res.json(
      children
    );

  } catch (error) {

    console.error(
      "Fetch available children error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const updateUserAsAdmin = async (
  req: Request,
  res: Response
) => {

  try {

    const userId =
      Number(
        req.params.userId
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid user ID",
      });

    }


    const user =
      await getUserById(
        userId
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    const fullName =
      String(
        req.body.full_name || ""
      ).trim();


    const email =
      String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();


    const phone =
      req.body.phone
        ? String(
            req.body.phone
          ).trim()
        : null;


    const region =
      req.body.region ===
        undefined
        ? undefined
        : req.body.region
          ? String(
              req.body.region
            ).trim()
          : null;


    if (
      !fullName ||
      !email
    ) {

      return res.status(400).json({
        message:
          "Full name and email are required",
      });

    }


    const finalRegion =
      region ===
        undefined
        ? user.region
        : region;


    if (
      user.role ===
        "parent" &&
      !finalRegion
    ) {

      return res.status(400).json({
        message:
          "Region is required for parents",
      });

    }


    const existingEmailUser =
      await getUserByEmail(
        email
      );


    if (
      existingEmailUser &&
      Number(
        existingEmailUser.id
      ) !== userId
    ) {

      return res.status(409).json({
        message:
          "Email already exists",
      });

    }


    await updateUserByAdmin(
      userId,
      fullName,
      email,
      phone,
      finalRegion
    );


    const updatedUser =
      await getUserById(
        userId
      );


    return res.json({
      message:
        "User updated successfully",
      user: updatedUser
        ? {
            id:
              updatedUser.id,
            full_name:
              updatedUser.full_name,
            email:
              updatedUser.email,
            role:
              updatedUser.role,
            phone:
              updatedUser.phone,
            region:
              updatedUser.region,
            avatar_url:
              updatedUser.avatar_url,
            is_active:
              updatedUser.is_active,
          }
        : null,
    });

  } catch (error) {

    console.error(
      "Update user error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const changeUserStatus = async (
  req: Request,
  res: Response
) => {

  try {

    const userId =
      Number(
        req.params.userId
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid user ID",
      });

    }


    const user =
      await getUserById(
        userId
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    const isActive =
      req.body.is_active;


    if (
      typeof isActive !==
      "boolean"
    ) {

      return res.status(400).json({
        message:
          "is_active must be true or false",
      });

    }


    await updateUserActiveStatus(
      userId,
      isActive
    );


    return res.json({
      message:
        isActive
          ? "User activated successfully"
          : "User deactivated successfully",
    });

  } catch (error) {

    console.error(
      "Update user status error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchUserDeleteInfo = async (
  req: Request,
  res: Response
) => {

  try {

    const userId =
      Number(
        req.params.userId
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid user ID",
      });

    }


    const user =
      await getUserById(
        userId
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    const children =
      await getLinkedChildrenForUser(
        userId
      );


    return res.json({
      user: {
        id:
          user.id,
        full_name:
          user.full_name,
        email:
          user.email,
        role:
          user.role,
        region:
          user.region,
      },
      children,
      child_count:
        children.length,
    });

  } catch (error) {

    console.error(
      "Fetch user delete info error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const removeUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {

  try {

    const userId =
      Number(
        req.params.userId
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid user ID",
      });

    }


    if (
      req.auth &&
      Number(
        req.auth.id
      ) === userId
    ) {

      return res.status(400).json({
        message:
          "You cannot delete your own account",
      });

    }


    const user =
      await getUserById(
        userId
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    const deleteMode =
      String(
        req.body?.delete_mode ||
        "none"
      )
        .trim()
        .toLowerCase();


    if (
      ![
        "none",
        "selected",
        "all",
      ].includes(
        deleteMode
      )
    ) {

      return res.status(400).json({
        message:
          "delete_mode must be none, selected, or all",
      });

    }


    if (
      user.role !==
        "parent" &&
      deleteMode !==
        "none"
    ) {

      return res.status(400).json({
        message:
          "Children can only be deleted with a parent account",
      });

    }


    const linkedChildren =
      await getLinkedChildrenForUser(
        userId
      );


    let childrenToDelete:
      any[] = [];


    if (
      deleteMode ===
        "all"
    ) {

      childrenToDelete =
        linkedChildren;

    }


    if (
      deleteMode ===
        "selected"
    ) {

      const childIds =
        parsePositiveIds(
          req.body?.child_ids
        );


      if (
        childIds.length ===
        0
      ) {

        return res.status(400).json({
          message:
            "Please select at least one child",
        });

      }


      const selectedChildren =
        await getSelectedLinkedChildren(
          userId,
          childIds
        );


      if (
        selectedChildren.length !==
        childIds.length
      ) {

        return res.status(400).json({
          message:
            "One or more selected children are not linked to this parent",
        });

      }


      childrenToDelete =
        selectedChildren;

    }


    const deletedChildIds:
      number[] = [];


    for (
      const child of
      childrenToDelete
    ) {

      const childId =
        Number(
          child.id
        );


      await deleteChildAssignments(
        childId
      );


      const result =
        await deleteChild(
          childId
        );


      if (
        result.affectedRows >
        0
      ) {

        deletedChildIds.push(
          childId
        );

      }

    }


    if (
      user.role ===
        "parent"
    ) {

      const deletedIds =
        new Set(
          deletedChildIds
        );


      for (
        const child of
        linkedChildren
      ) {

        const childId =
          Number(
            child.id
          );


        if (
          !deletedIds.has(
            childId
          )
        ) {

          await clearLegacyParentName(
            childId
          );

        }

      }

    }


    await deleteAllAssignmentsForUser(
      userId
    );


    const affectedRows =
      await deleteUser(
        userId
      );


    if (
      affectedRows ===
      0
    ) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    return res.json({
      message:
        "User deleted successfully",
      deleted_user_id:
        userId,
      deleted_children:
        deletedChildIds,
      deleted_children_count:
        deletedChildIds.length,
    });

  } catch (error) {

    console.error(
      "Delete user error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchAssignments = async (
  req: Request,
  res: Response
) => {

  try {

    const assignments =
      await getAllChildAssignments();


    return res.json(
      assignments
    );

  } catch (error) {

    console.error(
      "Fetch assignments error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};


export const fetchChildUsers = async (
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


    const childId =
      Number(
        req.params.childId
      );


    if (
      !Number.isInteger(
        childId
      ) ||
      childId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid child ID",
      });

    }


    const currentUser =
      await getUserById(
        req.auth.id
      );


    if (!currentUser) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (
      !currentUser.is_active
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    if (
      currentUser.role ===
      "therapist"
    ) {

      const managedChild =
        await getChildForUser(
          currentUser.id,
          childId
        );


      if (!managedChild) {

        return res.status(404).json({
          message:
            "Child not found or not assigned to this therapist",
        });

      }


      const users =
        await getUsersForChild(
          childId
        );


      return res.json(
        users.filter(
          user =>
            user.role ===
            "parent"
        )
      );

    }


    if (
      currentUser.role !==
      "admin"
    ) {

      return res.status(403).json({
        message:
          "Access denied",
      });

    }


    const child =
      await getChildById(
        childId
      );


    if (!child) {

      return res.status(404).json({
        message:
          "Child not found",
      });

    }


    const users =
      await getUsersForChild(
        childId
      );


    return res.json(
      users
    );

  } catch (error) {

    console.error(
      "Fetch child users error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};

export const assignUserToChild = async (
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


    const childId =
      Number(
        req.body.child_id
      );


    const userId =
      Number(
        req.body.user_id
      );


    if (
      !Number.isInteger(
        childId
      ) ||
      childId <= 0 ||
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        message:
          "Valid child ID and user ID are required",
      });

    }


    const currentUser =
      await getUserById(
        req.auth.id
      );


    if (!currentUser) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (
      !currentUser.is_active
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    if (
      currentUser.role ===
      "therapist"
    ) {

      const managedChild =
        await getChildForUser(
          currentUser.id,
          childId
        );


      if (!managedChild) {

        return res.status(404).json({
          message:
            "Child not found or not assigned to this therapist",
        });

      }

    } else if (
      currentUser.role ===
      "admin"
    ) {

      const child =
        await getChildById(
          childId
        );


      if (!child) {

        return res.status(404).json({
          message:
            "Child not found",
        });

      }

    } else {

      return res.status(403).json({
        message:
          "Access denied",
      });

    }


    const user =
      await getUserById(
        userId
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (
      currentUser.role ===
        "therapist" &&
      user.role !==
        "parent"
    ) {

      return res.status(403).json({
        message:
          "Therapists can only assign parents to their children",
      });

    }


    if (
      currentUser.role ===
        "admin" &&
      user.role !==
        "parent" &&
      user.role !==
        "therapist"
    ) {

      return res.status(400).json({
        message:
          "Only parents and therapists can be assigned to children",
      });

    }


    if (
      Number(
        user.is_active
      ) !== 1
    ) {

      return res.status(400).json({
        message:
          "Inactive users cannot be assigned to children",
      });

    }


    const result =
      await linkUserToChild(
        userId,
        childId
      );


    if (
      user.role ===
      "parent"
    ) {

      await syncLegacyParentName(
        childId,
        user.full_name
      );

    }


    return res.status(
      result.alreadyLinked
        ? 200
        : 201
    ).json({
      message:
        result.alreadyLinked
          ? "User is already assigned to this child"
          : "User assigned to child successfully",
      assignment_id:
        result.assignmentId,
    });

  } catch (error) {

    console.error(
      "Assign user to child error:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Server Error";


    if (
      message ===
        "This child already has a parent" ||
      message ===
        "This child already has a therapist"
    ) {

      return res.status(409).json({
        message,
      });

    }


    if (
      message ===
        "User not found" ||
      message ===
        "Only parents and therapists can be linked to children"
    ) {

      return res.status(400).json({
        message,
      });

    }


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};

export const removeUserFromChild = async (
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


    const childId =
      Number(
        req.params.childId
      );


    const userId =
      Number(
        req.params.userId
      );


    if (
      !Number.isInteger(
        childId
      ) ||
      childId <= 0 ||
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        message:
          "Invalid child or user ID",
      });

    }


    const currentUser =
      await getUserById(
        req.auth.id
      );


    if (!currentUser) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (
      !currentUser.is_active
    ) {

      return res.status(403).json({
        message:
          "This account is inactive",
      });

    }


    if (
      currentUser.role ===
      "therapist"
    ) {

      const managedChild =
        await getChildForUser(
          currentUser.id,
          childId
        );


      if (!managedChild) {

        return res.status(404).json({
          message:
            "Child not found or not assigned to this therapist",
        });

      }

    } else if (
      currentUser.role !==
      "admin"
    ) {

      return res.status(403).json({
        message:
          "Access denied",
      });

    }


    const user =
      await getUserById(
        userId
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (
      currentUser.role ===
        "therapist" &&
      user.role !==
        "parent"
    ) {

      return res.status(403).json({
        message:
          "Therapists can only remove parent assignments",
      });

    }


    const affectedRows =
      await unlinkUserFromChild(
        userId,
        childId
      );


    if (
      affectedRows ===
      0
    ) {

      return res.status(404).json({
        message:
          "Assignment not found",
      });

    }


    if (
      user.role ===
      "parent"
    ) {

      await clearLegacyParentName(
        childId
      );

    }


    return res.json({
      message:
        "User removed from child successfully",
    });

  } catch (error) {

    console.error(
      "Remove user from child error:",
      error
    );


    return res.status(500).json({
      message:
        "Server Error",
    });

  }

};

