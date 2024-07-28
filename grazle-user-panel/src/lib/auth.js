import { getProfileApi } from "@/apis";

export async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  try {
    const res = await getProfileApi(token);
    return res && res.data;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}