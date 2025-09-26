/**
 * API client for communicating with the Django backend
 */

import type { components, operations } from './api-types.js';

// Extract types from generated API types
export type Circuit = components['schemas']['Circuit'];
export type CircuitRequest = components['schemas']['CircuitRequest'];
export type PatchedCircuitRequest = components['schemas']['PatchedCircuitRequest'];
export type PaginatedCircuitList = components['schemas']['PaginatedCircuitList'];
export type SvelteFlowModel = components['schemas']['SvelteFlowModel'];
export type SvelteFlowNode = components['schemas']['SvelteFlowNode'];
export type SvelteFlowEdge = components['schemas']['SvelteFlowEdge'];
export type Metadata = components['schemas']['Metadata'];

// Extract response types from operations
export type CircuitListResponse = operations['circuits_list']['responses']['200']['content']['application/json'];
export type CircuitCreateResponse = operations['circuits_create']['responses']['201']['content']['application/json'];
export type CircuitRetrieveResponse = operations['circuits_retrieve']['responses']['200']['content']['application/json'];
export type CircuitUpdateResponse = operations['circuits_update']['responses']['200']['content']['application/json'];
export type CircuitPartialUpdateResponse = operations['circuits_partial_update']['responses']['200']['content']['application/json'];
export type CircuitAnalyzeResponse = operations['circuits_analyze_create']['responses']['200']['content']['application/json'];

// Request types using generated schemas
export type CreateCircuitRequest = CircuitRequest;
export type UpdateCircuitRequest = PatchedCircuitRequest;

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
		const response = await this.request<PaginatedCircuitList>('/circuits/');
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
	async updateCircuitWithFlowData(id: number, flowData: Partial<SvelteFlowModel>): Promise<Circuit> {
		return this.request<Circuit>(`/circuits/${id}/`, {
			method: 'PATCH',
			body: JSON.stringify({
				svelte_flow_model: flowData
			}),
		});
	}

	// Circuit analysis
	async analyzeCircuit(id: number, analysisType: string = 'static'): Promise<CircuitAnalyzeResponse> {
		return this.request<CircuitAnalyzeResponse>(`/circuits/${id}/analyze/`, {
			method: 'POST',
			body: JSON.stringify({
				analysis_type: analysisType
			}),
		});
	}
}

// Export singleton instance
export const apiClient = new ApiClient();
