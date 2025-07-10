const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
  }) {
    return this.request<{ access_token: string; token_type: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ access_token: string; token_type: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/api/auth/me');
  }

  async logout() {
    const result = await this.request('/api/auth/logout', { method: 'POST' });
    this.clearToken();
    return result;
  }

  // Document endpoints
  async getDocuments(params?: { skip?: number; limit?: number; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return this.request<any[]>(`/api/documents${query ? `?${query}` : ''}`);
  }

  async getDocument(id: string) {
    return this.request<any>(`/api/documents/${id}`);
  }

  async createDocument(document: {
    title: string;
    content?: string;
    tags?: string[];
    language?: string;
    writing_goal?: string;
    is_public?: boolean;
  }) {
    return this.request<any>('/api/documents/', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updateDocument(id: string, updates: any) {
    return this.request<any>(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/api/documents/${id}`, { method: 'DELETE' });
  }

  async duplicateDocument(id: string) {
    return this.request<any>(`/api/documents/${id}/duplicate`, { method: 'POST' });
  }

  // AI Suggestions endpoints
  async generateSuggestions(request: {
    document_id: string;
    content: string;
    language?: string;
    writing_goal?: string;
  }) {
    return this.request<any>('/api/ai/suggestions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSuggestions(documentId: string, type?: string) {
    const query = type ? `?suggestion_type=${type}` : '';
    return this.request<any[]>(`/api/ai/suggestions/${documentId}${query}`);
  }

  async applySuggestion(suggestionId: string) {
    return this.request(`/api/ai/suggestions/${suggestionId}/apply`, { method: 'PUT' });
  }

  async dismissSuggestion(suggestionId: string) {
    return this.request(`/api/ai/suggestions/${suggestionId}/dismiss`, { method: 'PUT' });
  }

  async analyzeTone(content: string) {
    return this.request<any>('/api/ai/tone-analysis', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async checkPlagiarism(content: string) {
    return this.request<any>('/api/ai/plagiarism-check', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Analytics endpoints
  async getDocumentAnalytics(documentId: string) {
    return this.request<any>(`/api/analytics/document/${documentId}`);
  }

  async getReadabilityScore(documentId: string) {
    return this.request<any>(`/api/analytics/document/${documentId}/readability`);
  }

  async getUserStats() {
    return this.request<any>('/api/analytics/user/stats');
  }
}

export const apiClient = new ApiClient();
export default apiClient;