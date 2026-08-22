export type UserRole =
  | "therapist"
  | "parent"
  | "admin";

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: number | boolean;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type CurrentUserResponse =
  | AuthUser
  | {
      user: AuthUser;
    };

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.0.2.2:5000";

let authToken: string | null =
  null;

let authUser: AuthUser | null =
  null;

const parseResponse = async <T>(
  response: Response
): Promise<T> => {
  const text =
    await response.text();

  let data: unknown =
    null;

  if (text) {
    try {
      data =
        JSON.parse(text);
    } catch {
      data =
        text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (
        data as {
          message?: unknown;
        }
      ).message === "string"
        ? (
            data as {
              message: string;
            }
          ).message
        : `Request failed (${response.status})`;

    throw new Error(
      message
    );
  }

  return data as T;
};

export const loginUser =
  async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    const response =
      await fetch(
        `${API_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email:
              email.trim(),
            password,
          }),
        }
      );

    const data =
      await parseResponse<LoginResponse>(
        response
      );

    authToken =
      data.token;

    authUser =
      data.user;

    return data;
  };

export const fetchCurrentUser =
  async (): Promise<AuthUser> => {
    if (!authToken) {
      throw new Error(
        "Authentication required"
      );
    }

    const response =
      await fetch(
        `${API_URL}/users/me`,
        {
          headers: {
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );

    if (
      response.status === 401
    ) {
      clearAuthSession();
    }

    const data =
      await parseResponse<CurrentUserResponse>(
        response
      );

    const user =
      typeof data === "object" &&
      data !== null &&
      "user" in data
        ? data.user
        : data;

    if (
      !user ||
      typeof user !== "object" ||
      !("role" in user)
    ) {
      clearAuthSession();

      throw new Error(
        "Invalid user response"
      );
    }

    authUser =
      user as AuthUser;

    return authUser;
  };

export const authRequest =
  async <T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!authToken) {
      throw new Error(
        "Authentication required"
      );
    }

    const headers =
      new Headers(
        options.headers
      );

    headers.set(
      "Authorization",
      `Bearer ${authToken}`
    );

    if (
      options.body &&
      !headers.has(
        "Content-Type"
      )
    ) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }

    const response =
      await fetch(
        `${API_URL}${path}`,
        {
          ...options,
          headers,
        }
      );

    if (
      response.status === 401
    ) {
      clearAuthSession();
    }

    return parseResponse<T>(
      response
    );
  };

export const getAuthToken =
  () => authToken;

export const getCurrentUser =
  () => authUser;

export const hasAuthSession =
  () =>
    Boolean(
      authToken &&
      authUser
    );

export const clearAuthSession =
  () => {
    authToken =
      null;

    authUser =
      null;
  };