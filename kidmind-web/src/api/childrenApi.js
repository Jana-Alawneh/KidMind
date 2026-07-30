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