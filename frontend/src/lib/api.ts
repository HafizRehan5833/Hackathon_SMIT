import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:1000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Analytics API calls (note: backend has /analytics/analytics/ prefix)
export const analyticsAPI = {
  getTotalStudents: () => api.get('/analytics/analytics/total-students'),
  getStudentsByDepartment: () => api.get('/analytics/analytics/students-by-department'),
  getRecentStudents: () => api.get('/analytics/analytics/students/recent'),
  getActiveStudents: () => api.get('/analytics/analytics/students/active_last_7_days'),
};

// Student API calls
export const studentAPI = {
  createThread: () => api.post('/students/thread'),
  sendMessage: (threadId: string, userInput: string) =>
    api.post('/students/chat', { thread_id: threadId, user_input: userInput }),
};

// User API calls
export const userAPI = {
  register: (name: string, email: string, password: string) =>
    api.post('/users/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/users/login', { email, password }),
  resetPassword: (email: string) =>
    api.post('/users/reset-password', { email }),
};

export default api;