import axios from 'axios';

const API_BASE_URL = 'https://eduprompt.up.railway.app/BE';

export async function getExampleData() {
    const response = await axios.get(`${API_BASE_URL}/api/test`);
    return response.data;
}


