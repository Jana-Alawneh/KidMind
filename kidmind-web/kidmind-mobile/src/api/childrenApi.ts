export type Child = {
  id: number;
  full_name: string;
  age: number;
  gender: "Female" | "Male";
  parent_name: string;
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

    return handleResponse(response);
  };


export const addChild = async (
  child: ChildPayload
) => {

  const url = `${API_URL}/children`;

  console.log("POST URL:", url);
  console.log("POST CHILD:", child);

  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(child),
    }
  );

  const responseText =
    await response.text();

  console.log(
    "POST STATUS:",
    response.status
  );

  console.log(
    "POST RESPONSE:",
    responseText
  );

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" &&
      data?.message
        ? data.message
        : "Failed to add child"
    );
  }

  return data;

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
      body: JSON.stringify(child),
    }
  );

  return handleResponse(response);
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

  return handleResponse(response);
};