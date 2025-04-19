import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  collegeCode: string;
  type: 'student' | 'company';
}

export interface Resume {
  _id: string;
  userId: string;
  name: string;
  email: string;
  suggestedRole: string;
  experience: string;
  skills: string[];
  collegeCode: string;
  uploadDate: string;
}

export interface JobMatch {
  _id: string;
  userId: string;
  jobDescription: string;
  collegeCode: string;
  matches: {
    id: string;
    name: string;
    email: string;
    score: number;
  }[];
  date: string;
}

export interface SkillsAnalysis {
  skills: {
    strong: string[];
    improve: string[];
  };
  careerPath: string[];
  suggestions: string[];
}

export interface JobMatchResult {
  resume: {
    _id: string;
    name: string;
    email: string;
    suggestedRole: string;
  };
  score: number;
  highlights: string[];
}

// API Service
export const apiService = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    const { token, userType, collegeCode, userId } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    return {
      token,
      userType,
      collegeCode,
      userId,
    };
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    collegeCode: string;
    type: 'student' | 'company';
  }) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Resume Management
  getUserResume: async () => {
    const response = await api.get('/resume/user');
    return response.data;
  },

  getResumesByCollegeCode: async (collegeCode: string) => {
    const response = await api.get(`/resumes?collegeCode=${collegeCode}`);
    return response.data;
  },

  uploadResume: async (formData: FormData) => {
    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadResume: async (resumeId: string) => {
    const response = await api.get(`/resume/${resumeId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Job Matching
  matchResumes: async (jobDescription: string, collegeCode: string, topN: number = 5) => {
    const response = await api.post('/match', {
      jobDescription,
      collegeCode,
      topN,
    });
    return response.data.matches;
  },

  getMatchHistory: async () => {
    const response = await api.get('/match/history');
    return response.data;
  },

  // Skills Analysis
  getSkillsAnalysis: async () => {
    const response = await api.get('/skills/analysis');
    return response.data;
  },
};

export default apiService; 