import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const getChildren = async () => {
  const response = await API.get("/children");
  return response.data;
};