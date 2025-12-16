import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getExampleData() {
    const response = await axios.get(`${API_BASE_URL}/api/test`);
    return response.data;
}


