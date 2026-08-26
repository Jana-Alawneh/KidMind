/*import axios from "axios";

const API_URL = "http://localhost:5000";

const API = axios.create({
  baseURL: API_URL,
});


export const getChildren = async () => {
  const response = await API.get("/children");

  return response.data;
};


export const getChildById = async (id) => {
  const response = await API.get(
    `/children/${id}`
  );

  return response.data;
};


export const addChild = async (child) => {
  const response = await fetch(
    `${API_URL}/children`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(child),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Failed to add child"
    );
  }

  return data;
};


export const updateChild = async (
  id,
  child
) => {
  const response = await fetch(
    `${API_URL}/children/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(child),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Failed to update child"
    );
  }

  return data;
};


export const deleteChild = async (id) => {
  const response = await fetch(
    `${API_URL}/children/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      "Failed to delete child"
    );
  }

  return data;
};
*/
import api from "../services/api";


export const getChildren = async () => {
  const response =
    await api.get(
      "/children"
    );

  return response.data;
};


export const getChildById = async (
  id
) => {
  const response =
    await api.get(
      `/children/${id}`
    );

  return response.data;
};


export const addChild = async (
  child
) => {
  const response =
    await api.post(
      "/children",
      child
    );

  return response.data;
};


export const updateChild = async (
  id,
  child
) => {
  const response =
    await api.put(
      `/children/${id}`,
      child
    );

  return response.data;
};


export const deleteChild = async (
  id
) => {
  const response =
    await api.delete(
      `/children/${id}`
    );

  return response.data;
};