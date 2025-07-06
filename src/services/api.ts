const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    // Determine the correct API base URL
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (import.meta.env.VITE_API_BASE_URL) {
      this.baseUrl = import.meta.env.VITE_API_BASE_URL;
    } else {
      // Default to port 3000 for API
      const currentOrigin = window.location.origin;
      this.baseUrl = currentOrigin.replace(':5173', ':3000');
    }
    
    // Ensure we have /api at the end
    if (!this.baseUrl.endsWith('/api')) {
      this.baseUrl += '/api';
    }
    
    console.log('🔗 API Service initialized with base URL:', this.baseUrl);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Print jobs
  async getPrintJobs(clientId?: string, limit?: number) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/print-jobs?${params.toString()}`);
  }

  async submitPrintJob(jobData: any) {
    return this.request('/print-jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // Printers
  async getPrinters(clientId?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    
    return this.request(`/printers?${params.toString()}`);
  }

  // Clients
  async getClients() {
    return this.request('/clients');
  }

  async saveClient(client: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  // Stats
  async getStats(clientId?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    
    return this.request(`/stats?${params.toString()}`);
  }

  // Test endpoints
  async simulatePrintJob(clientId?: string) {
    return this.request('/test/simulate-print', {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    });
  }

  // Debug endpoint
  async getClientDebugInfo(clientId: string) {
    return this.request(`/debug/client/${clientId}`);
  }

  // Manual test print job
  async triggerTestPrint(clientId: string) {
    return this.request(`/debug/test-print/${clientId}`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();