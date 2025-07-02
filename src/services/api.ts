const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
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
}

export const apiService = new ApiService();