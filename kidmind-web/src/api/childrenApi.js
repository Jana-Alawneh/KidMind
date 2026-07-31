import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const getChildren = async () => {
  const response = await API.get("/children");
  return response.data;
};

export const addChild = async (child) => {
    const response = await fetch("http://localhost:5000/children", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(child),
    });

    if (!response.ok) {
        throw new Error("Failed to add child");
    }

    return await response.json();
};

export const updateChild = async (id, child) => {
    const response = await fetch(
        `http://localhost:5000/children/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(child),
        }
    );

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => null);

        throw new Error(
            errorData?.message ||
            "Failed to update child"
        );
    }

    return response.json();
};

export const deleteChild = async (id) => {
  const response = await fetch(`http://localhost:5000/children/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete child");
  }

  return response.json();
};