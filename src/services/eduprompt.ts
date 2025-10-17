import axios from 'axios';

const API_BASE_URL = 'https://eduprompt.up.railway.app/BE';

// Ví dụ hàm gọi API GET
export async function getExampleData() {
  const response = await axios.get(`${API_BASE_URL}/api/v1/example`);
  return response.data;
}

// Bạn có thể thêm các hàm gọi API khác ở đây


