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


const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.0.2.2:5000"
).replace(/\/$/, "");


const handleResponse = async (
  response: Response
) => {

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.message ||
      "Request failed"
    );

  }

  return data;

};


export const getChildren =
  async (): Promise<Child[]> => {

    const response = await fetch(
      `${API_URL}/children`
    );

    return handleResponse(
      response
    );

  };


export const getChildById = async (
  id: number
): Promise<Child> => {

  const response = await fetch(
    `${API_URL}/children/${id}`
  );

  return handleResponse(
    response
  );

};


export const addChild = async (
  child: ChildPayload
) => {

  const response = await fetch(
    `${API_URL}/children`,
    {
      method: "POST",
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

  return handleResponse(
    response
  );

};


export const updateChild = async (
  id: number,
  child: ChildPayload
) => {

  const response = await fetch(
    `${API_URL}/children/${id}`,
    {
      method: "PUT",
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

  return handleResponse(
    response
  );

};


export const deleteChild = async (
  id: number
) => {

  const response = await fetch(
    `${API_URL}/children/${id}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(
    response
  );

};