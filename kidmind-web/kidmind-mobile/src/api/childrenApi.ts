import {
  authRequest,
} from "@/api/authApi";


export type Child = {
  id: number;
  full_name: string;
  age: number;
  gender: "Female" | "Male";
  parent_name: string;
  region: string | null;
  notes: string | null;
  score?: number | string | null;
  status?: string | null;
  last_assessment?: string | null;
  image?: string | null;
};


export type ChildPayload = {
  full_name: string;
  age: number;
  gender: "Female" | "Male";
  parent_name: string;
  region: string;
  notes: string;
};


export const getChildren =
  async (): Promise<Child[]> => {

    const data =
      await authRequest<Child[]>(
        "/children"
      );

    return Array.isArray(
      data
    )
      ? data
      : [];

  };


export const getChildById =
  async (
    id: number
  ): Promise<Child> => {

    return authRequest<Child>(
      `/children/${id}`
    );

  };


export const addChild =
  async (
    child: ChildPayload
  ) => {

    return authRequest(
      "/children",
      {
        method: "POST",
        body:
          JSON.stringify(
            child
          ),
      }
    );

  };


export const updateChild =
  async (
    id: number,
    child: ChildPayload
  ) => {

    return authRequest(
      `/children/${id}`,
      {
        method: "PUT",
        body:
          JSON.stringify(
            child
          ),
      }
    );

  };


export const deleteChild =
  async (
    id: number
  ) => {

    return authRequest(
      `/children/${id}`,
      {
        method: "DELETE",
      }
    );

  };