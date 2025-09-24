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

export interface SvelteFlowNode {
	id: string;
	type: string;
	position: {
		x: number;
		y: number;
	};
	data: {
		type: string;
	};
	measured: {
		width: number;
		height: number;
	};
	selected: boolean;
	dragging: boolean;
}

export interface SvelteFlowEdge {
	id: string;
	source: string;
	sourceHandle: string;
	target: string;
	targetHandle: string;
}

export interface SvelteFlowMetadata {
	nodeCounter: number;
	lastModified: string;
}

export interface SvelteFlowModel {
	nodes: SvelteFlowNode[];
	edges: SvelteFlowEdge[];
	metadata: SvelteFlowMetadata;
}

export interface CreateCircuitRequest {
	name: string;
	description?: string;
	svelte_flow_model?: {
		nodes?: SvelteFlowNode[];
		edges?: SvelteFlowEdge[];
		metadata?: Partial<SvelteFlowMetadata>;
	};
}

export interface UpdateCircuitRequest {
	name?: string;
	description?: string;
	svelte_flow_model?: {
		nodes?: SvelteFlowNode[];
		edges?: SvelteFlowEdge[];
		metadata?: Partial<SvelteFlowMetadata>;
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

	// Helper method to update circuit with flow data
	async updateCircuitWithFlowData(id: number, flowData: {
		nodes?: SvelteFlowNode[];
		edges?: SvelteFlowEdge[];
		metadata?: Partial<SvelteFlowMetadata>;
	}): Promise<Circuit> {
		return this.request<Circuit>(`/circuits/${id}/`, {
			method: 'PATCH',
			body: JSON.stringify({
				svelte_flow_model: flowData
			}),
		});
	}
}

// Export singleton instance
export const apiClient = new ApiClient();
