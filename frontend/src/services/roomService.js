import { apiCall } from "../utils/api";

class RoomService {
  static async getAllRooms() {
    const response = await apiCall("http://localhost:5000/api/rooms");
    return await response.json();
  }
}

export default RoomService;
