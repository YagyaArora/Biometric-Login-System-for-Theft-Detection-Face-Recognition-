const API_URL = 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  has_face_data: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface FaceVerificationResponse {
  verified: boolean;
  confidence: number;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    return { error: data.error || 'An error occurred' };
  }
  
  return { data };
}

// Auth API
export const authApi = {
  async register(username: string, email: string, password: string): Promise<ApiResponse<{ user_id: string }>> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  },

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await handleResponse<LoginResponse>(response);
    
    if (result.data?.token) {
      localStorage.setItem('authToken', result.data.token);
    }
    
    return result;
  },
};

// Face API
export const faceApi = {
  async registerFace(userId: string, imageFile: File): Promise<ApiResponse<{ success: boolean }>> {
    const formData = new FormData();
    formData.append('face_image', imageFile);
    formData.append('user_id', userId);
    
    const response = await fetch(`${API_URL}/face/register-face`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  async verifyFace(userId: string, imageFile: File): Promise<ApiResponse<FaceVerificationResponse>> {
    const formData = new FormData();
    formData.append('face_image', imageFile);
    formData.append('user_id', userId);
    
    const response = await fetch(`${API_URL}/face/verify-face`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },
};

// User API
export const userApi = {
  async getProfile(token: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Helper function to convert base64 to File
// This is useful when you have a base64 string from the Camera component
// and need to convert it to a File object for the API
// Example usage:
// const file = base64ToFile(base64String, 'face.jpg');
// await faceApi.registerFace(userId, file);
export function base64ToFile(base64: string, filename: string): Promise<File> {
  return fetch(base64)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: 'image/jpeg' }));
}
