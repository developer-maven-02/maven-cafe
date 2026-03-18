import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  // Remove global default Content-Type for JSON
  // headers: { "Content-Type": "application/json" },
});

// GET request
export const get = async (url: string) => {
  try {
    const res = await api.get(url);
    return res.data;
  } catch (error: any) {
    console.log("GET ERROR:", error);
    throw error.response?.data || error.message;
  }
};

// POST request
export const post = async (url: string, data: any, isMultipart = false) => {
  try {
    const config = isMultipart ? {} : { headers: { "Content-Type": "application/json" } };
    const res = await api.post(url, data, config);
    return res.data;
  } catch (error: any) {
    console.log("POST ERROR:", error);
    throw error.response?.data || error.message;
  }
};

// PUT request
export const put = async (url: string, data: any, isMultipart = false) => {
  try {
    const config = isMultipart ? {} : { headers: { "Content-Type": "application/json" } };
    const res = await api.put(url, data, config);
    return res.data;
  } catch (error: any) {
    console.log("PUT ERROR:", error);
    throw error.response?.data || error.message;
  }
};

// PATCH
export const patch = async (url: string, data: any) => {
  try {
    const res = await api.patch(url, data);
    return res.data;
  } catch (error: any) {
    console.log("PATCH ERROR:", error);
    throw error.response?.data || error.message;
  }
};

// DELETE
export const remove = async (url: string) => {
  try {
    const res = await api.delete(url);
    return res.data;
  } catch (error: any) {
    console.log("DELETE ERROR:", error);
    throw error.response?.data || error.message;
  }
};

export default api;