import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('humantic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const signup = (email, password) => api.post('/api/auth/signup', { email, password });

// Onboarding
export const completeOnboarding = (answer1, answer2, depthPreference) => 
  api.post('/api/onboarding', { answer1, answer2, depth_preference: depthPreference });

// Research
export const submitResearch = (topic, goal) => api.post('/api/research', { topic, goal });
export const getResearch = () => api.get('/api/research');

// Findings
export const getFindings = (topicId, category) => {
  const params = {};
  if (topicId) params.topic_id = topicId;
  if (category) params.category = category;
  return api.get('/api/findings', { params });
};
export const getFindingById = (id) => api.get(`/api/findings/${id}`);
export const updateFinding = (id, status) => api.patch(`/api/findings/${id}`, { status });

// Pins
export const getPins = () => api.get('/api/pins');
export const addPin = (description) => api.post('/api/pins', { description });
export const deletePin = (id) => api.delete(`/api/pins/${id}`);

// Chat
export const getChatSessions = () => api.get('/api/sessions');
export const createChatSession = () => api.post('/api/sessions');
export const getChatMessages = (sessionId) => api.get(`/api/sessions/${sessionId}/messages`);
export const sendChatMessage = (sessionId, content) => api.post(`/api/sessions/${sessionId}/messages`, { content });

export default api;
