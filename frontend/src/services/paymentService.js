import { apiCall } from "../utils/api";

export async function getPayments() {
  const response = await apiCall("http://localhost:5000/api/payments");
  return await response.json();
}
