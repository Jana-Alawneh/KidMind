import {
  authRequest,
  type AuthUser,
  type UserRole,
} from "./authApi";

export type AppearanceMode =
  | "system"
  | "light"
  | "dark";

export type UserPreferences = {
  email_notifications: boolean;
  account_notifications: boolean;
  session_notifications: boolean;
  progress_notifications: boolean;
  appearance: AppearanceMode;
};

export type SettingsUser =
  AuthUser & {
    region?: string | null;
    created_at?: string | null;
    last_login_at?: string | null;
  };

export type SettingsChild = {
  id: number;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  region?: string | null;
  status?: string | null;
};

export type AdminSettingsSummary = {
  total_users: number | string;
  total_admins: number | string;
  total_therapists: number | string;
  total_parents: number | string;
  total_children: number | string;
  total_sessions: number | string;
};

export type AdminRoleInfo = {
  type: "admin";
  system: {
    name: string;
    version: string;
  };
  summary: AdminSettingsSummary;
};

export type LinkedChildrenRoleInfo = {
  type: "parent" | "therapist";
  child_count: number;
  children: SettingsChild[];
};

export type SettingsRoleInfo =
  | AdminRoleInfo
  | LinkedChildrenRoleInfo;

export type UserSettingsResponse = {
  user: SettingsUser;
  settings: UserPreferences;
  role_info: SettingsRoleInfo;
};

export type UpdateProfilePayload = {
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  region?: string;
};

export type UpdateProfileResponse = {
  message: string;
  user: SettingsUser;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type MessageResponse = {
  message: string;
};

export type UpdatePreferencesResponse = {
  message: string;
  settings: UserPreferences;
};

export const getUserSettings =
  async (): Promise<UserSettingsResponse> => {
    return authRequest<UserSettingsResponse>(
      "/users/settings"
    );
  };

export const updateUserProfile =
  async (
    payload: UpdateProfilePayload
  ): Promise<UpdateProfileResponse> => {
    return authRequest<UpdateProfileResponse>(
      "/users/settings/profile",
      {
        method: "PUT",
        body: JSON.stringify(
          payload
        ),
      }
    );
  };

export const changeUserPassword =
  async (
    payload: ChangePasswordPayload
  ): Promise<MessageResponse> => {
    return authRequest<MessageResponse>(
      "/users/settings/password",
      {
        method: "PUT",
        body: JSON.stringify(
          payload
        ),
      }
    );
  };

export const updateUserPreferences =
  async (
    preferences: UserPreferences
  ): Promise<UpdatePreferencesResponse> => {
    return authRequest<UpdatePreferencesResponse>(
      "/users/settings/preferences",
      {
        method: "PUT",
        body: JSON.stringify(
          preferences
        ),
      }
    );
  };

export const getRoleLabel =
  (
    role: UserRole
  ) => {
    if (
      role === "admin"
    ) {
      return "Administrator";
    }

    if (
      role === "therapist"
    ) {
      return "Therapist";
    }

    return "Parent";
  };