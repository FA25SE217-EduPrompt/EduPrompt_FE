import axios from 'axios';

const API_BASE_URL = 'https://eduprompt.up.railway.app/BE';

// Đăng ký
export async function registerUser(data: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string }) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, data);
  return response.data;
}

// Đăng nhập
export async function loginUser(data: { email: string; password: string }) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
  return response.data;
}
// Đặt lại mật khẩu
export async function resetPassword(data: { token: string; newPassword: string }) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, data);
  return response.data;
}

// Đăng nhập với Google SSO
export async function loginWithGoogle(data: { tokenId: string }) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/google`, data);
  return response.data;
}


