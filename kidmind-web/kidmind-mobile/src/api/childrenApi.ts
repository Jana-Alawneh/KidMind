import {
  authRequest,
} from "@/api/authApi";


export type ChildAssignment = {
  assignment_id?: number;
  child_id?: number;
  user_id?: number;
  link_type?:
    | "parent"
    | "therapist";
  assigned_at?:
    | string
    | null;
  user_name?:
    | string
    | null;
  user_email?:
    | string
    | null;
  role?:
    | "parent"
    | "therapist";
  user_region?:
    | string
    | null;
};


export type Child = {
  id: number;

  full_name: string;

  age: number;

  gender:
    | "Female"
    | "Male";

  parent_name: string;

  region:
    | string
    | null;

  notes:
    | string
    | null;

  score?:
    | number
    | string
    | null;

  status?:
    | string
    | null;

  last_assessment?:
    | string
    | null;

  lastAssessment?:
    | string
    | null;

  image?:
    | string
    | null;

  assignments?:
    ChildAssignment[];
};


export type ChildPayload = {
  full_name: string;

  age: number;

  gender:
    | "Female"
    | "Male";

  parent_name: string;

  region: string;

  notes: string;

  parent_id?:
    | number
    | null;

  therapist_id?:
    | number
    | null;
};


export const getChildren =
  async (): Promise<
    Child[]
  > => {

    const data =
      await authRequest<
        Child[]
      >(
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
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

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
        method:
          "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

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
        method:
          "DELETE",
      }
    );

  };