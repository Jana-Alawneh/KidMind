import {
  AppState,
  type AppStateStatus,
} from "react-native";


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
  region?: string | null;
  avatar_url?: string | null;
  is_active?: number | boolean;
  is_online?: number | boolean | null;
  created_at?: string | null;
  last_login_at?: string | null;
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
  "http://127.0.0.1:5000";


let authToken: string | null =
  null;


let authUser: AuthUser | null =
  null;


type AuthUserListener = (
  user:
    AuthUser | null
) => void;


const authUserListeners =
  new Set<
    AuthUserListener
  >();


const notifyAuthUserListeners =
  () => {

    authUserListeners.forEach(
      listener => {

        try {

          listener(
            authUser
          );

        } catch {
          return;
        }

      }
    );

  };


export const subscribeAuthUser =
  (
    listener:
      AuthUserListener
  ) => {

    authUserListeners.add(
      listener
    );

    listener(
      authUser
    );

    return () => {

      authUserListeners.delete(
        listener
      );

    };

  };


let presenceInterval:
  ReturnType<
    typeof setInterval
  > | null =
  null;


let appStateSubscription:
  {
    remove: () => void;
  } | null =
  null;


const stopPresenceInterval =
  () => {

    if (
      presenceInterval
    ) {
      clearInterval(
        presenceInterval
      );

      presenceInterval =
        null;
    }

  };


const sendPresenceHeartbeat =
  async () => {

    if (
      !authToken
    ) {
      return;
    }

    try {

      await fetch(
        `${API_URL}/users/presence/heartbeat`,
        {
          method:
            "POST",
          headers: {
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );

    } catch (
      error
    ) {

      console.error(
        "Presence heartbeat failed:",
        error
      );

    }

  };


const sendPresenceOffline =
  async (
    token:
      string | null
  ) => {

    if (
      !token
    ) {
      return;
    }

    try {

      await fetch(
        `${API_URL}/users/presence/offline`,
        {
          method:
            "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    } catch {
      return;
    }

  };


const ensurePresenceInterval =
  () => {

    stopPresenceInterval();

    if (
      !authToken ||
      AppState.currentState !==
        "active"
    ) {
      return;
    }

    void sendPresenceHeartbeat();

    presenceInterval =
      setInterval(
        () => {
          void sendPresenceHeartbeat();
        },
        30000
      );

  };


const handleAppStateChange =
  (
    nextState:
      AppStateStatus
  ) => {

    if (
      nextState ===
      "active"
    ) {

      ensurePresenceInterval();
      return;

    }

    stopPresenceInterval();

    const token =
      authToken;

    void sendPresenceOffline(
      token
    );

  };


const startPresenceTracking =
  () => {

    if (
      !appStateSubscription
    ) {
      appStateSubscription =
        AppState.addEventListener(
          "change",
          handleAppStateChange
        );
    }

    ensurePresenceInterval();

  };


const stopPresenceTracking =
  (
    markOffline =
      true
  ) => {

    stopPresenceInterval();

    if (
      appStateSubscription
    ) {
      appStateSubscription
        .remove();

      appStateSubscription =
        null;
    }

    if (
      markOffline
    ) {
      const token =
        authToken;

      void sendPresenceOffline(
        token
      );
    }

  };


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
        JSON.parse(
          text
        );

    } catch {

      data =
        text;

    }

  }


  if (
    !response.ok
  ) {

    const message =
      typeof data ===
        "object" &&
      data !== null &&
      "message" in data &&
      typeof (
        data as {
          message?: unknown;
        }
      ).message ===
        "string"
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


export const getApiBaseUrl =
  () => API_URL;


export const resolveApiAssetUrl =
  (
    value?:
      | string
      | null
  ) => {

    const assetUrl =
      String(
        value || ""
      ).trim();


    if (
      !assetUrl
    ) {
      return "";
    }


    if (
      /^(https?:|data:|file:|content:|blob:)/i.test(
        assetUrl
      )
    ) {
      return assetUrl;
    }


    const baseUrl =
      API_URL.replace(
        /\/$/,
        ""
      );


    return assetUrl.startsWith(
      "/"
    )
      ? `${baseUrl}${assetUrl}`
      : `${baseUrl}/${assetUrl}`;

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
          method:
            "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
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


    notifyAuthUserListeners();


    startPresenceTracking();


    return data;

  };


export const fetchCurrentUser =
  async (): Promise<AuthUser> => {

    if (
      !authToken
    ) {
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
      response.status ===
      401
    ) {
      clearAuthSession();
    }


    const data =
      await parseResponse<CurrentUserResponse>(
        response
      );


    const user =
      typeof data ===
        "object" &&
      data !== null &&
      "user" in data
        ? data.user
        : data;


    if (
      !user ||
      typeof user !==
        "object" ||
      !(
        "role" in user
      )
    ) {

      clearAuthSession();


      throw new Error(
        "Invalid user response"
      );

    }


    authUser =
      user as AuthUser;


    notifyAuthUserListeners();


    startPresenceTracking();


    return authUser;

  };


export const authRequest =
  async <T>(
    path: string,
    options:
      RequestInit = {}
  ): Promise<T> => {

    if (
      !authToken
    ) {
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


    const isFormDataBody =
      typeof FormData !==
        "undefined" &&
      options.body instanceof
        FormData;


    /*
      Do not force a Content-Type for FormData.

      React Native / fetch must create the multipart
      boundary automatically so Multer can read req.file.
    */
    if (
      options.body &&
      !isFormDataBody &&
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
      response.status ===
      401
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

    stopPresenceTracking(
      true
    );


    authToken =
      null;


    authUser =
      null;


    notifyAuthUserListeners();

  };
