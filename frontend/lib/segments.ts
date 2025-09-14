import { api } from './api';

export interface Rule {
  field: string;
  operator: string;
  value: any;
}

export interface RulesGroup {
  op: 'AND' | 'OR';
  rules: (Rule | RulesGroup)[];
}

export interface Segment {
  id: string;
  name: string;
  rulesJson: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  campaigns: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
}

export interface CreateSegmentData {
  name: string;
  description?: string;
  rulesJson: string;
  createdBy: string;
}

export interface UpdateSegmentData {
  name: string;
  description?: string;
  rulesJson: string;
}

export interface SegmentCustomersResponse {
  success: boolean;
  data: {
    customers: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const segmentsApi = {
  // Get all segments
  getAll: async (): Promise<{ success: boolean; data: Segment[] }> => {
    const response = await api.get('/api/segments');
    return response.data;
  },

  // Get segment by ID
  getById: async (id: string): Promise<{ success: boolean; data: Segment }> => {
    const response = await api.get(`/api/segments/${id}`);
    return response.data;
  },

  // Create new segment
  create: async (data: CreateSegmentData): Promise<{ success: boolean; data: Segment }> => {
    const response = await api.post('/api/segments', data);
    return response.data;
  },

  // Update segment
  update: async (id: string, data: UpdateSegmentData): Promise<{ success: boolean; data: Segment }> => {
    const response = await api.put(`/api/segments/${id}`, data);
    return response.data;
  },

  // Delete segment
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/segments/${id}`);
    return response.data;
  },

  // Get customers in segment
  getCustomers: async (
    id: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<SegmentCustomersResponse> => {
    const response = await api.get(`/api/segments/${id}/customers?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Validate rules format
  validateRules: async (rules: RulesGroup | Rule): Promise<{ success: boolean; data: { isValid: boolean; error?: string } }> => {
    const response = await api.post('/api/segments/validate-rules', { rules });
    return response.data;
  },

  // Get audience count for rules
  getAudienceCount: async (rules: RulesGroup | Rule): Promise<{ success: boolean; data: { count: number; rules: RulesGroup | Rule } }> => {
    const response = await api.post('/api/segments/audience-count', { rules });
    return response.data;
  },

  // Generate SQL query for rules
  generateSqlQuery: async (rules: RulesGroup | Rule): Promise<{ success: boolean; data: { sql: string; countSql: string; rules: RulesGroup | Rule } }> => {
    const response = await api.post('/api/segments/generate-sql', { rules });
    return response.data;
  },

  // AI Helper - Convert text prompt to rules
  aiHelperConvert: async (prompt: string): Promise<{ success: boolean; data: { rules: RulesGroup | Rule; originalPrompt: string } }> => {
    const response = await api.post('/api/segments/ai-helper', { prompt });
    return response.data;
  },

  // Preview audience with rules
  previewAudience: async (rules: RulesGroup | Rule): Promise<{ success: boolean; data: { count: number; rules: RulesGroup | Rule } }> => {
    const response = await api.post('/api/segments/preview', { rules });
    return response.data;
  },

  // Get matching customers for rules
  getMatchingCustomers: async (rules: RulesGroup | Rule, page: number = 1, limit: number = 10): Promise<SegmentCustomersResponse> => {
    const response = await api.post(`/api/segments/matching-customers?page=${page}&limit=${limit}`, { rules });
    return response.data;
  }
};
