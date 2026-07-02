import { apiCall } from "../utils/api";

export async function getAllTenants() {
  const response = await apiCall("http://localhost:5000/api/tenants");
  return response.json();
}

export async function getMyProfile() {
  const response = await apiCall("http://localhost:5000/api/tenants/me");
  return response.json();
}
