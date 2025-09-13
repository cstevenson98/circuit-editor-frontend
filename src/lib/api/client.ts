/**
 * API client for communicating with the Django backend
 */

export interface Circuit {
	id: number;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
	svelte_flow_model: SvelteFlowModel | null;
}

export interface SvelteFlowModel {
	id: number;
	flow_data: {
		nodes?: any[];
		edges?: any[];
		viewport?: any;
		[key: string]: any;
	};
	created_at: string;
	updated_at: string;
}

export interface CreateCircuitRequest {
	name: string;
	description?: string;
}

export interface UpdateCircuitRequest {
	name?: string;
	description?: string;
}

export interface UpdateFlowDataRequest {
	flow_data: {
		nodes?: any[];
		edges?: any[];
		viewport?: any;
		[key: string]: any;
	};
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		// Use environment variable or fallback to default
		this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
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
				const errorData = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorData}`);
			}

			// Handle empty responses
			const text = await response.text();
			if (!text) return {} as T;

			return JSON.parse(text);
		} catch (error) {
			console.error(`API request failed: ${endpoint}`, error);
			throw error;
		}
	}

	// Circuit CRUD operations
	async getCircuits(): Promise<Circuit[]> {
		const response = await this.request<{count: number, results: Circuit[]}>('/circuits/');
		return response.results || [];
	}

	async getCircuit(id: number): Promise<Circuit> {
		return this.request<Circuit>(`/circuits/${id}/`);
	}

	async createCircuit(data: CreateCircuitRequest): Promise<Circuit> {
		return this.request<Circuit>('/circuits/', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateCircuit(id: number, data: UpdateCircuitRequest): Promise<Circuit> {
		return this.request<Circuit>(`/circuits/${id}/`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	}

	async deleteCircuit(id: number): Promise<void> {
		await this.request<void>(`/circuits/${id}/`, {
			method: 'DELETE',
		});
	}

	// SvelteFlow data operations
	async updateFlowData(circuitId: number, data: UpdateFlowDataRequest): Promise<Circuit> {
		return this.request<Circuit>(`/circuits/${circuitId}/flow_data/`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	}
}

// Export singleton instance
export const apiClient = new ApiClient();
